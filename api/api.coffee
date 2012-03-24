mongoskin = require('mongoskin')
async = require('async')
express = require("express")
nodeStatic = require('node-static');
utils = require("./utils.coffee")
requirejs = require('requirejs')
Backbone = require("backbone")
fs = require("fs")

db = mongoskin.db('127.0.0.1/test?auto_reconnect')
ObjectId = db.ObjectID

requirejs.config
    nodeRequire: require
    baseUrl: 'require/src'
    paths:
        cs: 'libs/requirejs/cs'
        hb: 'libs/requirejs/hb'
        backbone: 'libs/backbone/backbone'

id_regex = /[0-9a-fA-F]{24}/

collections = {}

class MongoCollection

    name: "test"
    Model: Backbone.Model

    constructor: (req, res) ->

    preSanitizeData: (req, res, data) =>
        return data

    # handle an api request
    handle_request = (req, res) ->

	    if req.method != "GET" and not req.session.email # TODO: this will be more robust... :P
	        return APIError(res, "You must be logged in to do that!", 403)

        console.log req.method, req.url, req.params.path, req.body

        req.params.path = req.params.path.split('/').filter((m) -> m.length > 0)
                
        #collection = collections[req.params.collection]
        @collection
        
        data = req.body
        
        if data.constructor is Object
             # merge the querystring params into the data body
            #data = $.extend(true, data, req.query)
            # we don't want users to be able to provide their own _id, so clear it
            delete data._id

        # remove fields starting with _ from the data object, except _id fields (which we set to new ObjectId's)
        recursively_sanitize data
        
        if req.params.id==undefined # document id was not specified in url (i.e. it references a collection itself)
            
            if not req.params.path.length # e.g. /api/courses/title/ (no id, but has sub-path)
                return APIError(res, "Invalid URL (document ID not specified or in invalid format).", 405)
        
            if req.method isnt 'POST' # we may want to allow GET here too, for querying a collection?
                return APIError(res, "Only POST (and sometimes GET) requests are allowed directly on collections.", 405)
            
            # TODO: check permissions
            
            collection.save data, (err, obj) ->
                res.json obj # return the newly created object (or should it just return the _id?)
            
            return
        
        query = {_id: collection.id(req.params.id)}
        
        # find the existing object in the database
        collection.find(query).toArray (err, arr) ->

            if err
                return APIError(res, "Error while performing query: " + err.toString(), 500)
            
            if arr.length == 0
                return APIError(res, "Specified '" + req.params.collection + "' document could not be found!", 404)
            
            document = arr[0]
            object = get_by_path(document, req.params.path)
            object_ref = req.params.path.join('.')
            
            parent_ref = null
            parent_is_array = false
            if object_ref
                parent_ref = req.params.path.slice(0,-1).join('.')
                if (get_by_path(document, req.params.path.slice(0,-1)) instanceof Array)
                    parent_is_array = true
            
            if object is null
                return APIError(res, "Specified path could not be found within document!", 404)
                    
            # helper function for returning json results
            mongo_json_response = (err, obj) ->
                if err
                    return APIError(res, "Error while performing operation: " + err.toString(), 500)
                if obj instanceof Object
                    obj = get_by_path(obj, req.params.path)
                else if (data instanceof Object && data._id)
                    obj = _id: data._id
                else
                    obj = {}
                console.log err, obj
                res.json obj
            
            update_and_respond = (update_obj) ->
                console.log query, update_obj
                collection.update(query, update_obj, {safe: true, upsert: true}, mongo_json_response)
                    
            type = req.method + " "

            if object_ref == ""
                type += "document"
            else
                if object instanceof Array
                    type += "array"
                else if object instanceof Object
                    type += "object"
                else
                    type += "value"
            
            switch type

                when 'GET document', 'GET array', 'GET object', 'GET value'
                    if object instanceof Object
                        if req.session.email
                            object._editor = true
                        else
                            object._editor = false
                    console.log object
                    return res.json(object)

                when 'POST document' # replace entire document with new document
                    return update_and_respond(data)
                when 'POST array'  # add new element to array (with generated _id, if object), or replace array (if data is an array)
                    operation = '$push'
                    if data instanceof Array
                        operation = '$set'
                    else if data instanceof Object
                        data._id = new ObjectId() # new object's _id won't be autogenerated; need to do it manually
                    # build up a $push or $set expression targeting the object path
                    return update_and_respond(wrap_in_object(operation, utils.wrap_in_object(object_ref, data)))
                when 'POST object', 'POST value' # replace object/value with new data (preserving _id if object has one)
                    if _id in object
                        data._id = object._id
                    # do an in-place update of the field with the new data
                    return update_and_respond({$set: utils.wrap_in_object(object_ref, data)})
                
                when 'PUT document' # update document fields (merge/extend into existing)
                    # merge the fields specified in data into the existing object
                    data = utils.merge(object, data)
                    # save the extended (updated) document back to the database
                    return update_and_respond(object)
                when 'PUT array' # hmm... use this spot to change order?
                    if data instanceof Array
                        return update_and_respond(merge_arrays(object, data))
                    return APIError(res, "Only arrays can be PUT onto arrays. " +
                                         "Use POST to add an item to the array, or to overwrite the array with a new one.", 405)
                when 'PUT object' # update subobject with new data object (merge/extend into existing, preserving _id)                
                    if (!(data instanceof Object) || (data instanceof Array))
                        return APIError(res, "Cannot PUT a non-object value on top of an object. Use POST if you want to replace the object with this value.", 405)
                    # merge the fields specified in data into the existing object
                    data = merge(object, data)
                    # save the extended (updated) object back to the database
                    return update_and_respond({$set: wrap_in_object(object_ref, data)})
                when 'PUT value'
                    # overwrite the value with the new data
                    return update_and_respond({$set: wrap_in_object(object_ref, data)})
                
                when 'DELETE document'
                    collection.remove(query, {safe: true}, mongo_json_response)
                when 'DELETE array'
                    return update_and_respond({$set: wrap_in_object(object_ref, [])})
                when 'DELETE object', 'DELETE value'
                    if (object._id && parent_is_array)
                        return update_and_respond({$pull: wrap_in_object(parent_ref, {_id: object._id})})
                    # remove the field from the document
                    collection.update query, {$unset: wrap_in_object(object_ref, 1)}, (err, obj) ->
                        if parent_is_array
                            return update_and_respond({$pull: wrap_in_object(parent_ref, null)})
                        else
                            return mongo_json_response(err, obj)


routing_pattern = '/:collection([a-z]+)/:id([0-9a-fA-F]{24})?:path(*)'

request_handler: (req, res) ->
	if req.params.collection not in collections
		return APIError(res, "Collection '" + req.params.collection + "' does not exist.", 404)
	collection = collections[req.params.collection]
	collection.handle_request(req, res)


router = ->
    @get "/", (req, res) ->
        (new nodeStatic.Server('./public')).serveFile('api_test.html', 200, {}, req, res)
    
    # attach the various HTTP verbs to the api path (for some reason this.all(...) doesn't work here)
    @get(routing_pattern, request_handler)
    @post(routing_pattern, request_handler)
    @put(routing_pattern, request_handler)
    @del(routing_pattern, request_handler)


class APIError

	constructor: (res, msg, code=500) ->
	    console.log "error:", msg
	    res.json
	    	_error:
	    		message: msg
	    		code: code
	    	code

module.exports = 
    collections: collections
    MongoCollection: MongoCollection
    router: router
    APIError: APIError

console.log module.exports
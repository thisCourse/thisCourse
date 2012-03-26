mongoskin = require('mongoskin')
mongojs = require('mongojs')
async = require('async')
express = require("express")
nodeStatic = require('node-static');
utils = require("./utils.coffee")
Backbone = require("backbone")
fs = require("fs")

#db = mongojs.connect("test")
db = mongoskin.db('127.0.0.1/test?auto_reconnect')
ObjectId = db.bson_serializer.ObjectID

collections = {}

class MongoCollection

    name: "test"
    #Model: Backbone.Model

    constructor: (req, res) ->
        @req = req
        @res = res
        @data = @getBodyData()
        @datatype = @getDataType()
        @path = @getSplitPath()
        @email = @getUserEmail()
        @handle_request()

    getBodyData: => @req.body

    getUserEmail: => @req.session.email

    getSplitPath: => @req.params.path.split('/').filter((m) -> m.length > 0)

    getDataType: => @data.constructor.name.toLowerCase()

    retrieveDocumentById: (callback) =>
        @query = _id: new ObjectId(@req.params.id)
        @collection.findOne @query, (err, doc) =>
            if err
                err = @getAPIError("Error loading document: " + err)
            else if not doc
                err = @getAPIError("Specified '" + @name + "' document could not be found!", 404)
            @document = doc
            @model = new @Model(@document) if @Model
            callback err

    getAPIError: (message, status) =>
        if message.message
            message = message.message
        return new APIError(@res, message.toString?() or message, status)

    findObjectByPath: (callback) =>
        @object = utils.get_by_path(@document, @path)
        @object_ref = @path.join('.')
        @parent_ref = null
        @parent_is_array = false
        if @object_ref
            parent_path = @path.slice(0,-1)
            @parent_ref = parent_path.join('.')
            if utils.get_by_path(@document, parent_path) instanceof Array
                @parent_is_array = true
        
        if @object is null
            callback @getAPIError("Specified path could not be found within document!", 404)
        else
            callback()

    # helper function for returning json results
    mongoJsonResponse: (err, obj) =>
        if err
            return @getAPIError("Error while performing operation: " + err.toString())
        if obj instanceof Object
            obj = utils.get_by_path(obj, @path)
        else if (@data instanceof Object && @data._id)
            obj = _id: @data._id
        else
            obj = {}
        console.log err, obj
        @res.json obj

    updateDatabaseAndRespond: (update_obj) =>
        console.log @query, update_obj
        @collection.update(@query, update_obj, {safe: true, upsert: true}, @mongoJsonResponse)

    determineObjectType: (callback) =>
        @type = @req.method + " "

        if @object_ref == ""
            @type += "document"
        else
            if @object instanceof Array
                @type += "array"
            else if @object instanceof Object
                @type += "object"
            else
                @type += "value"

        callback()

    permissionCheck: (callback) =>
        if @req.method != "GET" and not @email and not @name=="test" # TODO: this will be more robust... :P
            callback @getAPIError("You must be logged in to do that!", 403)
        callback()

    # handle an api request
    handle_request: =>

        console.log @req.method, @req.url, @path, @data
        
        if @data.constructor is Object
             # merge the querystring params into the data body
            #data = $.extend(true, data, req.query)
            # we don't want users to be able to provide their own _id, so clear it
            delete @data._id

        if @req.params.id==undefined # document id was not specified in url (i.e. it references a collection itself)
            
            if @path.length # e.g. /api/courses/title/ (no id, but has sub-path)
                return @getAPIError("Invalid URL (document ID not specified or in invalid format).", 405)
        
            if @req.method isnt 'POST' # we may want to allow GET here too, for querying a collection?
                return @getAPIError("Only POST (and sometimes GET) requests are allowed directly on collections.", 405)
            
            # TODO: check permissions
            
            @collection.save @data, (err, obj) =>
                @res.json obj # return the newly created object (or should it just return the _id?)
            
            return
        
        async.series [
            @permissionCheck
            @retrieveDocumentById
            @findObjectByPath
            @determineObjectType
            (callback) =>
                @finishProcessingRequest()
                callback null
        ]#, (err, results) =>

    finishProcessingRequest: =>
        
        switch @type

            when 'GET document', 'GET array', 'GET object', 'GET value'
                if @object instanceof Object
                    if @email
                        @object._editor = true
                    else
                        @object._editor = false
                console.log @object
                return @res.json(@object)

            when 'POST document' # replace entire document with new document
                return @updateDatabaseAndRespond(@data)
            when 'POST array'  # add new element to array (with generated _id, if object), or replace array (if data is an array)
                operation = '$push'
                if @data instanceof Array
                    operation = '$set'
                else if @data instanceof Object
                    @data._id = new ObjectId # new object's _id won't be autogenerated; need to do it manually
                # build up a $push or $set expression targeting the object path
                return @updateDatabaseAndRespond(utils.wrap_in_object(operation, utils.wrap_in_object(@object_ref, @data)))
            when 'POST object', 'POST value' # replace object/value with new data (preserving _id if object has one)
                if @object._id
                    @data._id = @object._id
                # do an in-place update of the field with the new data
                return @updateDatabaseAndRespond({$set: utils.wrap_in_object(@object_ref, @data)})
            
            when 'PUT document' # update document fields (merge/extend into existing)
                # merge the fields specified in data into the existing object
                @data = utils.merge(@object, @data)
                # save the extended (updated) document back to the database
                return @updateDatabaseAndRespond(@object)
            when 'PUT array' # hmm... use this spot to change order?
                if @data instanceof Array
                    return @updateDatabaseAndRespond(merge_arrays(@object, @data))
                return @getAPIError("Only arrays can be PUT onto arrays. " +
                                     "Use POST to add an item to the array, or to overwrite the array with a new one.", 405)
            when 'PUT object' # update subobject with new data object (merge/extend into existing, preserving _id)                
                if (!(@data instanceof Object) || (@data instanceof Array))
                    return @getAPIError("Cannot PUT a non-object value on top of an object. Use POST if you want to replace the object with this value.", 405)
                # merge the fields specified in data into the existing object
                @data = utils.merge(@object, @data)
                # save the extended (updated) object back to the database
                return @updateDatabaseAndRespond({$set: utils.wrap_in_object(@object_ref, @data)})
            when 'PUT value'
                # overwrite the value with the new data
                return @updateDatabaseAndRespond({$set: utils.wrap_in_object(@object_ref, @data)})
            
            when 'DELETE document'
                @collection.remove(@query, {safe: true}, @mongoJsonResponse)
            when 'DELETE array', 'DELETE object', 'DELETE value'
                if @object._id and @parent_is_array
                    return @updateDatabaseAndRespond({$pull: utils.wrap_in_object(@parent_ref, {_id: @object._id})})
                # remove the field from the document
                @collection.update @query, {$unset: utils.wrap_in_object(@object_ref, 1)}, (err, obj) =>
                    if @parent_is_array
                        return @updateDatabaseAndRespond({$pull: utils.wrap_in_object(@parent_ref, null)})
                    else
                        return @mongoJsonResponse(err, obj)


routing_pattern = '/:collection([a-z]+)/:id([0-9a-fA-F]{24})?:path(*)'

request_handler = (req, res) ->
    if req.params.collection not of collections
        return APIError(res, "Collection '" + req.params.collection + "' is not defined.", 404)
    try
        collection = new collections[req.params.collection](req, res)
    catch err
        new APIError "CAUGHT ERROR: " + err.toString(), 500
    

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
        console.log "Error:", msg
        res.json
            _error:
                message: msg
                code: code
            code

register_mongo_collection = (cls) ->
    cls.prototype.collection = db.collection(cls.prototype.name) # get the MongoDB collection reference
    collections[cls.prototype.name] = cls # store the collection class by name for later lookup

initialize = ->
    dir = __dirname + "/collections/"
    for file in fs.readdirSync(dir)
        require(dir + file)
    register_mongo_collection MongoCollection

module.exports = 
    collections: collections
    MongoCollection: MongoCollection
    router: router
    APIError: APIError
    register_mongo_collection: register_mongo_collection
    initialize: initialize

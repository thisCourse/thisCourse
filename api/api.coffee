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
                err = new APIError("Error loading document: " + err)
            else if not doc
                err = new APIError("Specified '" + @name + "' document could not be found!", 404)
            @document = doc
            @model = new @Model(@document) if @Model
            callback err

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
            callback new APIError("Specified path could not be found within document!", 404)
        else
            callback()

    # helper function for returning json results
    mongoJsonResponse: (err, obj) =>
        if err
            return new APIError("Error while performing operation: " + err.toString())
        if obj instanceof Object
            obj = utils.get_by_path(obj, @path)
        else if (@data instanceof Object && @data._id)
            obj = _id: @data._id
        else
            obj = {}
        console.log err, obj
        (new JSONResponse(obj)).send(@res) # TODO: ok?

    updateDatabaseAndRespond: (update_obj) =>
        console.log @query, update_obj
        @collection.update(@query, update_obj, {safe: true, upsert: true}, @mongoJsonResponse)

    determineObjectType: (callback) =>
        @type = @req.method + "_"

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
            return callback new APIError("You must be logged in to do that!", 403)
        callback()

    # if no document is selected, handle the request as an action on the collection itself
    handleDirectCollectionReference: (callback) =>
        if @req.params.id==undefined # document id was not specified in url (i.e. referencing collection itself)
            if @path.length # e.g. /api/courses/title/ (no id, but has sub-path)
                return callback new APIError("Invalid URL (document ID not specified or in invalid format).", 405)
            return @["process_#{@req.method}_collection"](callback)
        callback()

    # handle an api request
    handle_request: =>

        console.log @req.method, @req.url, @path, @data

        if @data._id
            delete @data._id
                
        async.series [
            @permissionCheck
            @handleDirectCollectionReference # needs to happen before @retrieveDocumentById
            @retrieveDocumentById
            @findObjectByPath
            @determineObjectType
            @finishProcessingRequest
        ], (jsonresponse) =>
            console.log "about to send", jsonresponse
            jsonresponse?.send? @res


    finishProcessingRequest: (callback) =>
        console.log "calling", "process_" + @type
        @["process_" + @type](callback) # run the handler for this "type" (method + target field type)

    ######################

    process_GET_collection: (callback) =>
        callback new APIError("The '#{ @name }' collection does not support GET queries.", 405)

    process_POST_collection: (callback) =>
        @collection.save @data, (err, obj) =>
            callback new JSONResponse(obj) # return the newly created object (or should it just return the _id?)

    process_PUT_collection: (callback) =>
        callback new APIError("You cannot PUT on a collection. Please use POST to create an object in the collection.", 405)

    process_DELETE_collection: (callback) =>
        callback new APIError("You cannot DELETE a collection. What would that even mean?", 405)

    ######################

    process_GET: (callback) =>
        if @object instanceof Object
            if @email
                @object._editor = true
            else
                @object._editor = false
        console.log @object
        callback new JSONResponse(@object)        

    process_GET_document: (callback) => @process_GET(callback)

    process_GET_array: (callback) => @process_GET(callback)

    process_GET_object: (callback) => @process_GET(callback)

    process_GET_value: (callback) => @process_GET(callback)

    # replace entire document with new document
    process_POST_document: (callback) => @updateDatabaseAndRespond(@data, callback)

    # add new element to array (with generated _id, if object), or replace array (if data is an array)
    process_POST_array: (callback) =>
        operation = '$push'
        if @data instanceof Array
            operation = '$set'
        else if @data instanceof Object
            @data._id = new ObjectId # new object's _id won't be autogenerated; need to do it manually
        # build up a $push or $set expression targeting the object path
        return @updateDatabaseAndRespond(utils.wrap_in_object(operation, utils.wrap_in_object(@object_ref, @data)), callback)

    # replace object/value with new data (preserving _id if object has one)
    process_POST_object: (callback) => 
        if @object._id
            @data._id = @object._id
        @process_POST_value()

    # do an in-place update of the field with the new data
    process_POST_value: (callback) =>
        @updateDatabaseAndRespond({$set: utils.wrap_in_object(@object_ref, @data)}, callback)
    
    # update document fields (merge/extend into existing)
    process_PUT_document: (callback) =>
        # merge the fields specified in data into the existing object
        @data = utils.merge(@object, @data)
        # save the extended (updated) document back to the database
        return @updateDatabaseAndRespond(@object, callback)
    
    process_PUT_array: (callback) =>
        if @data instanceof Array
            return @updateDatabaseAndRespond(merge_arrays(@object, @data), callback)
        return new APIError("Only arrays can be PUT onto arrays. " +
                             "Use POST to add an item to the array, or to overwrite the array with a new one.", 405)

    # update subobject with new data object (merge/extend into existing, preserving _id)                
    process_PUT_object: (callback) =>
        if (!(@data instanceof Object) || (@data instanceof Array))
            return new APIError("Cannot PUT a non-object value on top of an object. Use POST if you want to replace the object with this value.", 405)
        # merge the fields specified in data into the existing object
        @data = utils.merge(@object, @data)
        # save the extended (updated) object back to the database
        return @updateDatabaseAndRespond({$set: utils.wrap_in_object(@object_ref, @data)}, callback)

    process_PUT_value: (callback) =>
        # overwrite the value with the new data
        return @updateDatabaseAndRespond({$set: utils.wrap_in_object(@object_ref, @data)}, callback)
    
    process_DELETE_document: (callback) =>
        @collection.remove(@query, {safe: true}, @mongoJsonResponse)

    process_DELETE_array: (callback) =>
        @process_DELETE_value()

    process_DELETE_object: (callback) =>
        if @object._id and @parent_is_array
            return @updateDatabaseAndRespond({$pull: utils.wrap_in_object(@parent_ref, {_id: @object._id})}, callback)
        @process_DELETE_value()

    process_DELETE_value: (callback) =>
        # remove the field from the document
        @collection.update @query, {$unset: utils.wrap_in_object(@object_ref, 1)}, (err, obj) =>
            if @parent_is_array
                return @updateDatabaseAndRespond({$pull: utils.wrap_in_object(@parent_ref, null)}, callback)
            else
                return @mongoJsonResponse(err, obj)


routing_pattern = '/:collection([a-z]+)/:id([0-9a-fA-F]{24})?:path(*)'

request_handler = (req, res) ->
    if req.params.collection not of collections
        return (new APIError("Collection '" + req.params.collection + "' is not defined.", 404)).send(res)
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

class JSONResponse
    constructor: (body, status=200) ->
        @status = status
        @body = body or {}
        @headers = {}

    send: (res) =>
        res.json @body, @headers, @status

class APIError extends JSONResponse
    constructor: (msg, status=500) ->
        console.log "Error:", msg
        if msg.message then msg = msg.message
        super {_error: msg.toString?() or msg}, status

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

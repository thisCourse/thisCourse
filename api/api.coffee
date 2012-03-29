http = require("http")
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
        @datatype = @data.constructor.name.toLowerCase()
        @path = @splitPath(@req.params.path)
        @email = @getUserEmail()
        @handle_request()

    getBodyData: => @req.body

    getUserEmail: => @req.session.email

    splitPath: (path) => path.split('/').filter((m) -> m.length > 0)

    retrieveDocumentById: (callback) =>
        @query = _id: new ObjectId(@req.params.id.toString())
        @collection.findOne @query, (err, doc) =>
            if err
                err = new APIError("Error loading document: " + err)
            else if not doc
                err = new APIError("Specified '" + @name + "' document could not be found!", 404)
            @document = doc
            if @Model
                @model = new @Model(@document) # turn the document into an instance of the appropriate Model
                @document = @model.toJSON() # use the JSON output of the model as our document data
            callback err

    findObjectByPath: (callback) =>
        @rawpath = @path.slice(0)
        @object = utils.get_by_path(@document, @path)
        @object_ref = @path.join('.')
        @parent_ref = null
        @parent_type = ""
        if @object_ref
            parent_path = @path.slice(0,-1)
            @parent_ref = parent_path.join('.')
            @parent = utils.get_by_path(@document, parent_path)
            @parent_type = @parent.constructor.name.toLowerCase()

        if @object is null
            callback new APIError("Specified path could not be found within document!", 404)
        else
            callback()

    traceLazyRelations: (callback) =>
        if @model
            obj = @model
            for key,i in @rawpath
                obj = obj.get(key)
                if obj instanceof Backbone.Model or obj instanceof Backbone.Collection
                    @submodel = obj
                    @subpath = @path.slice(i+1)
            if @submodel
                console.log "SUBMODEL", @submodel.constructor.name
                console.log "SUBPATH", @subpath
                console.log "INCLUDE", @submodel.includeInJSON
                if @submodel instanceof Backbone.Model
                    @fullModelParams =
                        collection: @submodel.apiCollection
                        id: @submodel.id?.toString?() or undefined
                        path: "/" + @subpath.join("/")
                    #@fullModelURL = "/api/" + @fullModelParams.collection + "/" + @fullModelParams.id + @fullModelParams.path
                if @submodel instanceof Backbone.Collection
                    @fullModelParams =
                        collection: @submodel.model.prototype.apiCollection
                        path: ""
                    #@fullModelURL = "/api/" + @fullModelParams.collection + "/"
                if @fullModelParams and @submodel.includeInJSON!=true
                    @fullModelURL = "/api/" + @fullModelParams.collection + "/" + (@fullModelParams.id or "") + @fullModelParams.path
                    @fullModelURL = @fullModelURL.replace("//", "/") # to avoid double-slashes resulting from no ID
                    @isDenormalized = true
            callback()
        else
            callback()

    proxyToFullModel: (callback) =>

        # this is not a denormalized model we're addressing, so just proceed
        if not @isDenormalized
            return callback()

        isCollection = @submodel instanceof Backbone.Collection
        
        # don't proxy non-POST requests through to a collection
        if @req.method isnt "POST" and not @fullModelParams.id
            return callback()

        console.log "proxyToFullModel"

        proxy_res =
            json: (body, headers, status) =>
                console.log "GOT BACK DATA", body
                if status != 200
                    callback new APIError(body._error or body.toString(), status)
                else
                    if @subpath.length==0 and @req.method!="GET"
                        console.log "@subpath.length==0"
                        # use response from object creation as data (especially so we end up with the same _id)
                        if isCollection and @req.method=="POST" then utils.merge(@data, body)
                        # TODO: should go here, or more generally/specifically? needed for POSTing related 1-to-1 models, e.g. course.content
                        if body._id # copy the id from the proxied response into our object, so we don't overwrite the returned id
                            @object._id = body._id
                        # we're operating directly on the model (or collection), so filter by includeInJSON
                        utils.filter_object_fields @data, @submodel.includeInJSON
                        callback()
                    else if @req.method=="GET" or @subpath[0] not in @submodel.includeInJSON
                        console.log '@req.method=="GET" or @subpath[0] not in @submodel.includeInJSON'
                        # pass right through if it was just a GET request or if subpath isn't inside includeInJSON
                        callback new JSONResponse(body, status)
                    else # the field *is* in includeInJSON, so just proceed normally
                        console.log "field *is* in includeInJSON"
                        callback()
        
        @req.params = @fullModelParams
        @req.url = @fullModelURL
        
        request_handler @req, proxy_res
        
    # helper function for building JSON response
    mongoJsonResponse: (err, obj) =>
        if err
            return new APIError("Error while performing operation: " + err.toString())
        if obj instanceof Object
            obj = utils.get_by_path(obj, @path)
        else if (@data instanceof Object && @data._id)
            obj = _id: @data._id
        else
            obj = {}
        return new JSONResponse(obj)

    updateDatabase: (update_obj, callback) =>
        console.log @query, update_obj
        @collection.update @query, update_obj, {safe: true, upsert: true}, (err, obj) =>
            callback @mongoJsonResponse(err, obj)

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
                
        async.series [
            @permissionCheck
            @handleDirectCollectionReference # needs to happen before @retrieveDocumentById
            @retrieveDocumentById
            @findObjectByPath
            @traceLazyRelations
            @proxyToFullModel
            @determineObjectType
            @finishProcessingRequest
        ], (jsonresponse) =>
            if not jsonresponse
                jsonresponse = new APIError("The database did not return a response!", 500)
            jsonresponse.send @res


    finishProcessingRequest: (callback) =>
        console.log "calling", "process_" + @type
        @["process_" + @type](callback) # run the handler for this "type" (method + target field type)


    process_GET_collection: (callback) =>
        callback new APIError("The '#{ @name }' collection does not support GET queries.", 405)

    process_POST_collection: (callback) =>
        if @data._id
            delete @data._id
        @collection.save @data, (err, obj) =>
            callback new JSONResponse(_id: obj._id) # return the newly created object (or should it just return the _id?)

    process_PUT_collection: (callback) =>
        callback new APIError("You cannot PUT on a collection. Please use POST to create an object in the collection.", 405)

    process_DELETE_collection: (callback) =>
        callback new APIError("You cannot DELETE a collection. What would that even mean?", 405)

    process_GET_document: (callback) => @process_GET(callback)

    process_GET_array: (callback) => @process_GET(callback)

    process_GET_object: (callback) => @process_GET(callback)

    process_GET_value: (callback) => @process_GET(callback)

    process_GET: (callback) =>
        if @object instanceof Object
            if @email
                @object._editor = true
            else
                @object._editor = false
        console.log @object
        callback new JSONResponse(@object)

    # replace entire document with new document
    process_POST_document: (callback) =>
        if @data._id
            delete @data._id
        @updateDatabase(@data, callback)

    # add new element to array (with generated _id, if object), or replace array (if data is an array)
    process_POST_array: (callback) =>
        operation = '$push'
        if @data instanceof Array
            operation = '$set'
        else if @data instanceof Object
            @data._id or= new ObjectId # new object's _id won't be autogenerated; need to do it manually
        # build up a $push or $set expression targeting the object path
        return @updateDatabase(utils.wrap_in_object(operation, utils.wrap_in_object(@object_ref, @data)), callback)

    # replace object/value with new data (preserving _id if object has one)
    process_POST_object: (callback) => 
        @data._id = @object._id or new ObjectId
        @process_POST_value(callback)

    # do an in-place update of the field with the new data
    process_POST_value: (callback) =>
        @updateDatabase({$set: utils.wrap_in_object(@object_ref, @data)}, callback)
    
    # update document fields (merge/extend into existing)
    process_PUT_document: (callback) =>
        if @data._id
            delete @data._id
        # merge the fields specified in data into the existing object
        @data = utils.merge(@object, @data)
        # save the extended (updated) document back to the database
        return @updateDatabase(@object, callback)
    
    process_PUT_array: (callback) =>
        #if @data instanceof Array
        #    return @updateDatabase(merge_arrays(@object, @data), callback)
        return new APIError("Only arrays can be PUT onto arrays. " +
                             "Use POST to add an item to the array, or to overwrite the array with a new one.", 405)

    # update subobject with new data object (merge/extend into existing, preserving _id)                
    process_PUT_object: (callback) =>
        if (!(@data instanceof Object) || (@data instanceof Array))
            return new APIError("Cannot PUT a non-object value on top of an object. Use POST if you want to replace the object with this value.", 405)
        # merge the fields specified in data into the existing object
        console.log "about to merge"
        @data = utils.merge(@object, @data)
        console.log "merged"
        # save the extended (updated) object back to the database
        return @updateDatabase({$set: utils.wrap_in_object(@object_ref, @data)}, callback)

    process_PUT_value: (callback) =>
        # overwrite the value with the new data
        return @updateDatabase({$set: utils.wrap_in_object(@object_ref, @data)}, callback)
    
    process_DELETE_document: (callback) =>
        @collection.remove @query, {safe: true}, (err, obj) =>
            callback @mongoJsonResponse(err, obj)

    process_DELETE_array: (callback) =>
        @process_DELETE_value(callback)

    process_DELETE_object: (callback) =>
        if @object._id and @parent_type=="array"
            return @updateDatabase({$pull: utils.wrap_in_object(@parent_ref, {_id: @object._id})}, callback)
        @process_DELETE_value(callback)

    process_DELETE_value: (callback) =>
        # remove the field from the document
        @collection.update @query, {$unset: utils.wrap_in_object(@object_ref, 1)}, (err, obj) =>
            if @parent_type=="array"
                return @updateDatabase({$pull: utils.wrap_in_object(@parent_ref, null)}, callback)
            else
                callback @mongoJsonResponse(err, obj)


routing_pattern = '/:collection([a-z]+)/:id([0-9a-fA-F]{24})?:path(*)'

request_handler = (req, res) ->
    if req.params.collection not of collections
        return (new APIError("Collection '" + req.params.collection + "' is not defined.", 404)).send(res)
#    try
    collection = new collections[req.params.collection](req, res)
#    catch err
#        new APIError "CAUGHT ERROR: " + err.toString(), 500
    

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

global.clog = -> # do nothing! this is a log just for in the browser

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

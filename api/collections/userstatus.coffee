api = require("../api.coffee")
requirejs = require("../../requirejs.coffee")

requirejs ['cs!userstatus/models'], (models) =>

    class UserStatusMongoCollection extends api.MongoCollection
        name: 'userstatus'
        Model: models.UserStatusModel
        Collection: models.UserStatusCollection

        initialPermissionCheck: (callback) =>
            if ((@req.method is "POST" or @req.method is "PUT") and @email!="admin") or (@email!="admin" and @req.params.id==undefined)
                return callback new api.APIError("Must be logged in as admin", 403)
            callback()

        finishProcessingRequest: (callback) =>
            if @type not in ['GET_collection', 'GET_document', 'POST_document', 'POST_collection', 'PUT_document', 'PUT_collection']
                return callback new api.APIError("Cannot perform a #{@req.method} on a UserStatus collection (or the specified subpath).")
            super

        process_GET_document: (callback) =>
            # if @req.session.email isnt "admin" or @object.email == @req.session.email
            #     console.log @object.email == @req.session.email
            #     console.log @req.session.email
            #     console.log @object.email
            #     return callback new api.APIError("Must be logged in as admin", 403)
            # else
            callback new api.JSONResponse(@object)

        process_GET_collection: (callback) =>
            @collection.find().toArray? (err, userstatuses) =>
                if err then return callback new api.APIError(err)
                return callback new (api.JSONResponse)(userstatuses)
            
            

    api.register_mongo_collection UserStatusMongoCollection


    UserStatusMongoCollection: UserStatusMongoCollection
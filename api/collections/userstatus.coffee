api = require("../api.coffee")
requirejs = require("../../requirejs.coffee")

requirejs ['cs!userstatus/models'], (models) =>

    class UserStatusMongoCollection extends api.MongoCollection
        name: 'userstatus'
        Model: models.UserStatusModel
        Collection: models.UserStatusCollection

        initialPermissionCheck: (callback) =>
            if (@req.method is "POST" and @req.session.email isnt "admin") or (@req.session.email isnt "admin" and @req.session.email isnt @req.params.email.toString())
                return callback new api.APIError("Must be logged in as admin", 403)
            callback()

        finishProcessingRequest: (callback) =>
            if @type not in ['GET_collection', 'GET_document', 'POST_document', 'POST_collection']
                return callback new api.APIError("Cannot perform a #{@req.method} on a Grade collection (or the specified subpath).")
            super

        process_GET_document: (callback) =>
            @collection.findOne(email: @req.params.email.toString())? (err, userstatus) =>
                if err or not userstatus then return callback new api.APIError("You have no user status.", 404)
                return callback new (api.JSONResponse)(userstatus)

        process_GET_collection: (callback) =>
            @collection.find().toArray? (err, userstatuses) =>
                if err then return callback new api.APIError(err)
                return callback new (api.JSONResponse)(userstatuses)
            
            

    api.register_mongo_collection UserStatusMongoCollection


    UserStatusMongoCollection: UserStatusMongoCollection
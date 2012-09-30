api = require("../api.coffee")
requirejs = require("../../requirejs.coffee")

requirejs ['cs!auth/models'], (models) =>

    class UserMongoCollection extends api.MongoCollection
        name: 'user'
        Model: models.UserModel
        Collection: models.UserCollection

        finishProcessingRequest: (callback) =>
            if @type not in ['POST_collection', 'PUT_collection']
                return callback new api.APIError("Cannot perform a #{@req.method} on a User collection (or the specified subpath).")
            super

        process_POST_collection: (callback) =>
            # registration happens here?
            super callback
        
        process_PUT_collection: (callback) =>
            # login/logout happens here?
            super calback

        # process_GET_collection: (callback) =>
        #     query = @req.query
        #     @collection.find(query).toArray? (err, docs) =>
        #         if err then return callback new api.APIError("No matching documents found", 404)
        #         return callback new (api.JSONResponse)(docs)

            
            

    api.register_mongo_collection UserMongoCollection


    UserMongoCollection: UserMongoCollection
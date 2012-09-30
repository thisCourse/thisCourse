api = require("../api.coffee")
requirejs = require("../../requirejs.coffee")

requirejs ['cs!file/models'], (models) =>

    class FileMongoCollection extends api.MongoCollection
        name: 'file'
        Model: models.FileModel
        Collection: models.FileCollection

        process_GET_collection: (callback) =>
            query = @req.query
            @collection.find(query).toArray? (err, docs) =>
                if err then return callback new api.APIError("No matching documents found", 404)
                return callback new (api.JSONResponse)(docs)


    api.register_mongo_collection FileMongoCollection


    FileMongoCollection: FileMongoCollection
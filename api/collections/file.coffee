api = require("../api.coffee")
requirejs = require("../requirejs.coffee")

requirejs ['cs!file/models'], (models) =>

    class FileMongoCollection extends api.MongoCollection
        name: 'file'
        Model: models.FileModel
        Collection: models.FileCollection

        process_GET_collection: (callback) =>
            query = @req.query
            delete query._
            @collection.find(query).toArray? (err, docs) =>
                console.log docs
                if err then return callback new api.APIError("No matching documents found", 404)
                return callback new (api.JSONResponse)(docs)
            #callback new api.JSONResponse({test: 66}, 200)

            
            

    api.register_mongo_collection FileMongoCollection


    FileMongoCollection: FileMongoCollection
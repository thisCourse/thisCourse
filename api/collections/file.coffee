api = require("../api.coffee")
requirejs = require("../requirejs.coffee")

requirejs ['cs!file/models'], (models) =>

    class FileMongoCollection extends api.MongoCollection
        name: 'file'
        Model: models.FileModel
        Collection: models.FileCollection

        process_GET_collection: (callback) =>
            query = @req.query
            console.log query
            delete query._
            #if query._course then query._course = new api.db.bson_serializer.ObjectID(query._course)
            console.log query
            @collection.find(query).toArray? (err, docs) =>
                if err then return callback new api.APIError("No matching documents found", 404)
                return callback new (api.JSONResponse)(docs)
            #callback new api.JSONResponse({test: 66}, 200)

            
            

    api.register_mongo_collection FileMongoCollection


    FileMongoCollection: FileMongoCollection
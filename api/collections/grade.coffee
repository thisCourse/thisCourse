api = require("../api.coffee")
requirejs = require("../../requirejs.coffee")

requirejs ['cs!grade/models'], (models) =>

    class GradeMongoCollection extends api.MongoCollection
        name: 'grade'
        Model: models.GradeModel
        Collection: models.GradeCollection

        initialPermissionCheck: (callback) =>
            if not @email
                return callback new APIError("You must be logged in to view grades!", 403)
            callback()

        finishProcessingRequest: (callback) =>
            if @type not in ['GET_collection']
                return callback new api.APIError("Cannot perform a #{@req.method} on a Grade collection (or the specified subpath).")
            super

        process_GET_collection: (callback) =>
            # query = @req.query
            @collection.find(email: @email).toArray? (err, grades) =>
                if err or grades.length==0 then return callback new api.APIError("You have no grades.", 404)
                return callback new (api.JSONResponse)(grades)

            
            

    api.register_mongo_collection GradeMongoCollection


    GradeMongoCollection: GradeMongoCollection
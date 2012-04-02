api = require("../api.coffee")
requirejs = require("../requirejs.coffee")

requirejs ['cs!lecture/models'], (models) =>

    class LectureMongoCollection extends api.MongoCollection
        name: 'lecture'
        Model: models.LectureModel
        Collection: models.LectureCollection

    api.register_mongo_collection LectureMongoCollection

    
    LectureMongoCollection: LectureMongoCollection
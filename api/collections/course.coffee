api = require("../api.coffee")
requirejs = require("../requirejs.coffee")

requirejs ['cs!course/models'], (models) =>

    class CourseMongoCollection extends api.MongoCollection
        name: 'course'
        Model: models.CourseModel
        Collection: models.CourseCollection

    api.register_mongo_collection CourseMongoCollection


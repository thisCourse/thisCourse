api = require("../api.coffee")
requirejs = require("../../requirejs.coffee")

requirejs ['cs!group/models'], (models) =>

    class GroupMongoCollection extends api.MongoCollection
        name: 'course'
        Model: models.GroupModel
        Model: models.GroupCollection

    api.register_mongo_collection GroupMongoCollection

    
    GroupMongoCollection: GroupMongoCollection
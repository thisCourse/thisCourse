api = require("../api.coffee")
requirejs = require("../requirejs.coffee")

requirejs ['cs!assignment/models'], (models) =>

    class AssignmentMongoCollection extends api.MongoCollection
        name: 'assignment'
        Model: models.AssignmentModel
        Collection: models.AssignmentCollection

    api.register_mongo_collection AssignmentMongoCollection


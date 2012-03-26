api = require("../api.coffee")
requirejs = require("../requirejs.coffee")

requirejs ['cs!content/models'], (models) =>

    class ContentMongoCollection extends api.MongoCollection
        name: 'content'
        Model: models.ContentModel
        Collection: models.ContentCollection

    api.register_mongo_collection ContentMongoCollection


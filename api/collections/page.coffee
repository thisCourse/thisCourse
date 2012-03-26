api = require("../api.coffee")
requirejs = require("../requirejs.coffee")

requirejs ['cs!page/models'], (models) =>

    class PageMongoCollection extends api.MongoCollection
        name: 'page'
        Model: models.PageModel
        Collection: models.PageCollection

    api.register_mongo_collection PageMongoCollection


api = require("../api.coffee")
requirejs = require("../../requirejs.coffee")

requirejs ['cs!probe/models'], (models) =>

    class ProbeMongoCollection extends api.MongoCollection
        name: 'probe'
        Model: models.ProbeModel
        Collection: models.ProbeCollection

    api.register_mongo_collection ProbeMongoCollection

    
    ProbeMongoCollection: ProbeMongoCollection
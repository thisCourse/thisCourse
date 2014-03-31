api = require("../api.coffee")
requirejs = require("../../requirejs.coffee")

requirejs ['cs!training/models'], (models) =>

    class TrainingMongoCollection extends api.MongoCollection
        name: 'training'
        Model: models.TrainingModel
        Collection: models.TrainingCollection

    api.register_mongo_collection TrainingMongoCollection

    
    TrainingMongoCollection: TrainingMongoCollection
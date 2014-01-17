mongoskin = require('mongoskin')
async = require('async')
# express = require("express")
$ = require("jquery-deferred")
requirejs = require("../requirejs.coffee")
_ = require("underscore")

db = mongoskin.db('127.0.0.1/testing?auto_reconnect')

idRegex = /^[0-9a-fA-F]{24}$/


Backbone.sync = (method, model, options) ->
    deferred = new $.Deferred
    collection = db.collection(model.constructor.mongocollection)
    data = model.toJSON()
    if data._id
        data._id = db.ObjectID(data._id)
    query = _id: data._id
    switch method
        when "create"
            collection.update query, data, {safe: true, upsert: true}, (err, obj) ->
                if err
                    deferred.reject(err)
                else
                    deferred.resolve(obj)
        when "read"
            collection.findOne query, (err, obj) ->
                if err
                    deferred.reject(err)
                else
                    deferred.resolve(obj)
        when "update"
            collection.update query, data, {safe: true}, (err, obj) ->
                if err
                    deferred.reject(err)
                else
                    deferred.resolve(obj)
        when "delete"
            collection.remove query, (err, obj) ->
                if err
                    deferred.reject(err)
                else
                    deferred.resolve(obj)
    promise = deferred.promise()
    promise.success = promise.then
    promise.error = promise.fail
    return promise


getModel = (path, modelName, callback) ->
    requirejs ["cs!" + path + "/models"], (models) ->
        Model = models?[modelName]
        if not Model
            callback "Model '#{modelName}' not found in '#{path + '/models'}'"
        Model.mongocollection = path + "/" + modelName
        callback null, Model


handleOperation = (path, operation, data={}, callback) ->
    components = _.filter(path.split("/"), (comp) -> comp)
    modelName = components.pop()
    if idRegex.test(modelName) # the last path component was an ID
        data._id = modelName
        modelName = components.pop()
    getModel components.join("/"), modelName, (err, Model) ->
        model = new Model(data)
        switch operation
            when "create", "update"
                promise = model.save()
            when "read"
                promise = model.fetch()
            when "delete"
                promise = model.delete()
        promise.then (obj) ->
            callback null, obj
        promise.fail (err) ->
            callback err

module.exports =
    handleOperation: handleOperation

# for i in [1..10]
#     handleOperation "assignment/AssignmentModel", "create", {test: Math.random()}, (err, result) -> console.log result

handleOperation "assignment/AssignmentModel", "read", {_id: "50650ee80000d39732000008"}, (err, result) -> console.log "read", result

handleOperation "assignment/AssignmentModel", "update", {_id: "50650ee80000d39732000008", sum: Math.random()}, (err, result) -> console.log "write", result

handleOperation "assignment/AssignmentModel", "read", {_id: "50650ee80000d39732000008"}, (err, result) -> console.log "read", result


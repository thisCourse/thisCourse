mongoskin = require('mongoskin')
async = require('async')
# express = require("express")
$ = require("jquery")
requirejs = require("../requirejs.coffee")
_ = require("underscore")

db = mongoskin.db('127.0.0.1/testing?auto_reconnect')

idRegex = /^[0-9a-fA-F]{24}$/

# return a callback function that will trigger a deferred to reject/resolve appropriately
deferredCallback = (deferred) ->
    (err, obj) ->
        if err
            deferred.reject(err)
        else
            deferred.resolve(obj)

Backbone.sync = (method, model, options) ->
    
    deferred = new $.Deferred
    collection = db.collection(model.constructor.mongocollection)
    data = model.toJSON()
    
    if data._id
        data._id = db.ObjectID(data._id.toString())
    query = _id: data._id
    
    switch method
        when "create"
            collection.save data, deferredCallback(deferred)
        when "read"
            collection.findOne query, deferredCallback(deferred)
        when "update"
            delete data._id # can't do a $set for _id attribute, so clear it out
            collection.update query, $set: data, {safe: true}, deferredCallback(deferred)
        when "delete"
            collection.remove query, deferredCallback(deferred)
    
    # update the model with the result returned from MongoDB
    deferred.then (result) ->
        if _.isObject(result)
            model.set result
    
    # get a promise from the deferred, and add some aliases so it behaves more like an AJAX request
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
    getModel: getModel
    requirejs: requirejs

# for i in [1..10]
#     handleOperation "assignment/AssignmentModel", "create", {test: Math.random()}, (err, result) -> console.log result

# handleOperation "assignment/AssignmentModel", "read", {_id: "50650ee80000d39732000008"}, (err, result) -> console.log "read", result

# handleOperation "assignment/AssignmentModel", "create", {sum: Math.random()}, (err, result) ->
#     id = result._id
#     console.log "write", result
#     handleOperation "assignment/AssignmentModel", "read", {_id: id}, (err, result) ->
#         console.log "read", result
#         handleOperation "assignment/AssignmentModel", "update", {_id: id, color: "pink"}, (err, result) ->
#             console.log "update", result
#             handleOperation "assignment/AssignmentModel", "read", {_id: id}, (err, result) -> console.log "read", result

# handleOperation "assignment/AssignmentModel", "read", {_id: "50650ee80000d39732000008"}, (err, result) -> console.log "read", result

getModel "nugget", "NuggetModel", (err, mod) -> console.log "args", arguments

if false
    api = require("./api/newapi")
    api.getModel "nugget", "NuggetModel", (err, mod) -> global.NuggetModel = mod
    q = new NuggetModel
    q.save()
    
    
mongoskin = require('mongoskin')
async = require('async')
express = require("express")
nodeStatic = require('node-static')
utils = require("./utils.coffee")
fs = require("fs")

db = mongoskin.db('127.0.0.1/analytics?auto_reconnect')
ObjectId = db.bson_serializer.ObjectID

request_handler = (req, res) ->
    if not req.session.email then return res.json error: "Must be logged in", 403
    data = req.body
    data.email = req.session.email
    db.collection("pretest").save req.body, (err, obj) =>
        res.json obj

module.exports =
    request_handler: request_handler
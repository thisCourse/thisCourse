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
    if req.method is "POST"
        data = req.body
        data.timestamp = new Date()
        data.email = req.session.email
        db.collection("pretest").save req.body, (err, obj) =>
            res.json obj
    else
        db.collection("pretest").find(email: req.session.email, {limit:1, sort:[['inc', -1]]}).toArray (err, doc) =>
            inc = doc.length and doc[0]?.inc or 0
            res.end inc.toString()
module.exports =
    request_handler: request_handler
var $ = require('jquery')
var mongoskin = require("mongoskin")
var mongodb = require("mongodb")
var ObjectId = mongodb.BSONPure.ObjectID
var db = mongoskin.db("localhost/test?auto_reconnect")
var async = require("async")
var express = require("express")
    require('express-namespace')

var api = require('./api')

var courses = db.collection("courses")

// initialize express server
var app = express.createServer()
app.use(express.bodyParser())
app.listen(3000)

app.use(function (req, res, next) {
    res.removeHeader("X-Powered-By")
    next()
});

app.use('/static', express.static(__dirname + '/public'))
app.use('/backbone', express.static(__dirname + '/backbone'));

// express routing
app.namespace('/api', api.router)

app.all('/', function(req, res){
    var data = $.extend(true, req.body, req.query)
    res.send(data)
})



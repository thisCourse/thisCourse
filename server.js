//var $ = require('jquery')
var mongoskin = require("mongoskin")
var mongodb = require("mongodb")
var ObjectId = mongodb.BSONPure.ObjectID
var db = mongoskin.db("localhost/test?auto_reconnect")
var fs = require("fs")
var async = require("async")
var express = require("express")
    require('express-namespace')

var api = require('./api/api')
var s3 = require('./api/s3')

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
app.namespace('/s3', s3.router)

app.use('/kirsh', function(request, response) {
  fs.readFile(__dirname + '/public/index.html', function(err,text) {
      response.end(text)
  })
})

// app.all('/', function(req, res){
    // var data = $.extend(true, req.body, req.query)
    // res.send(data)
// })

var server = express.createServer(
  //express.logger(), // Log responses to the terminal using Common Log Format.
  //express.responseTime() // Add a special header with timing information.
)

server.use(express.vhost('beta.thiscourse.com', app))

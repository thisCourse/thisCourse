var mongoskin = require("mongoskin")

var cs = require("coffee-script")

var db = mongoskin.db("localhost/test?auto_reconnect")
var fs = require("fs")
var async = require("async")
var express = require("express")
    require('express-namespace')
var api = require('./api/api')
var s3 = require('./api/s3')
var RedisStore = require('connect-redis')(express)

var secrets = require("./secrets")

var auth = require("./auth")
var analytics = require("./api/analytics")

var courses = db.collection("courses")

var settings = {
	session: {
		key: 'token',
		secret: secrets.sessionSecret,
		cookie: {
			 path: '/',
			 httpOnly: false,
			 maxAge: 86400000
		},
		store: new RedisStore
	}
}

// initialize express server
var app = express.createServer(
    express.bodyParser(),
    express.cookieParser(),
    auth.token_middleware(),
    express.session(settings.session),
    auth.user_middleware(),
    express.responseTime()
)

app.listen(2000);

app.use(function (req, res, next) {
    res.removeHeader("X-Powered-By");
    delete req.query._;
    req.connection.remoteAddress = req.headers['x-real-ip'] || req.connection.remoteAddress;
    console.log((new Date).toISOString(), req.method, req.url.replace(/_=\d+/, ""), req.session.email, req.connection.remoteAddress);
    next();
})

app.use("/login", auth.login)
app.use("/logout", auth.logout)
app.use("/hash", auth.hash)
app.use("/check", auth.check)

app.use('/static', express.static(__dirname + '/public'))
app.use('/src', express.static(__dirname + '/src'))
app.use('/build', express.static(__dirname + '/build'))

// express routing
app.namespace('/api', api.router)
app.namespace('/s3', s3.router)
app.namespace('/analytics', analytics.router)

app.get('/ucsd/cogs160/wi12/*', function(request, response) {
  fs.readFile(__dirname + '/public/cogs160.html', function(err,text) {
      response.end(text)
  })
})

app.get('/ucsd/cogs187a/wi12/*', function(request, response) {
  fs.readFile(__dirname + '/public/cogs187a.html', function(err,text) {
      response.end(text)
  })
})

var base_html = "";

try {
  base_html = fs.readFileSync(__dirname + '/build/test_build.html')
} catch (e) {
  base_html = "The project has not been built. Please run 'make'."
}

app.get('/course/*', function(request, response) {
  response.end(base_html)
})

app.get('/src/*', function(request, response) {
  fs.readFile(__dirname + '/src/test_src.html', function(err,text) {
      response.end(text)
  })
})

app.get('/', function(request, response) {
  response.redirect("/course/")
})

app.get("/course", function(req, res) {
 	res.redirect("/course/")
})

var server = express.createServer(
  //express.logger(), // Log responses to the terminal using Common Log Format.
  // express.responseTime() // Add a special header with timing information.
)

server.use(express.vhost('beta.thiscourse.com', app))

api.initialize()

module.exports = app
mongoskin = require('mongoskin')
async = require('async')
express = require("express")
nodeStatic = require('node-static')
utils = require("./utils.coffee")
fs = require("fs")
redis = require("redis").createClient()

api = require("./api.coffee")

db = mongoskin.db('127.0.0.1/analytics?auto_reconnect')
ObjectId = db.bson_serializer.ObjectID

routing_pattern = '/:collection([a-z]+)/'

router = ->
    # attach the various HTTP verbs to the api path (for some reason this.all(...) doesn't work here)
    @get(routing_pattern, request_handler)
    @post(routing_pattern, request_handler)
    @put(routing_pattern, request_handler)
    @del(routing_pattern, request_handler)


request_handler = (req, res) ->
    handler = new (collections[req.params.collection])
    handler.handle_request(req, res)

class AnalyticsHandler
    
    handle_request: (req, res) =>
        @req = req
        @res = res
        if not @checkPermissions() then return
        @["handle_" + req.method] (json) =>
            json?.send(req, res)
    
    checkPermissions: =>
        if not @req.session.email
            @res.json error: "Must be logged in", 403
            return false
        return true
    
    handle_GET: (callback) =>
        callback new api.APIError("Analytics endpoint does not support GET requests.")
        
    handle_POST: (callback) =>
        callback new api.APIError("Analytics endpoint does not support POST requests.")

    handle_PUT: (callback) =>
        callback new api.APIError("Analytics endpoint does not support PUT requests.")

    handle_DELETE: (callback) =>
        callback new api.APIError("Analytics endpoint does not support DELETE requests.")
        
    save_analytics_object: (data, callback) =>
        if not @collection then return callback new api.APIError("No collection specified in AnalyticsHandler.")
        data.timestamp = new Date()
        data.email = @req.session.email if @req.session.email
        data.ip = @req.connection.remoteAddress
        @collection.save data, (err, obj) =>
            if err
                callback new api.APIError(err)
            else
                callback new api.JSONResponse(obj)


class NuggetAttempt extends AnalyticsHandler
    collection: db.collection("nuggetattempt")

    checkPermissions: =>
        if @req.method is "GET" then return true
        super

    handle_POST: (callback) =>
        return callback new api.APIError("No can do. Time is up.")
        @save_analytics_object @req.body, callback

    handle_GET: (callback) =>
        get_student_nugget_attempts @req.session.email, (err, claimed, attempted) =>
            callback new api.JSONResponse(claimed: claimed, attempted: attempted)

get_student_nugget_attempts = (email, callback) ->
    if not email
        return callback null, [], []
    db.collection("nuggetattempt").find(email: email).toArray (err, attempts) =>
        if err then return callback new api.APIError(err)
        claimed = {}
        attempted = {}
        for attempt in attempts
            if attempt.unclaimed
                delete claimed[attempt.nugget]
                delete attempted[attempt.nugget]
            else if attempt.claimed
                claimed[attempt.nugget] = _id: attempt.nugget, points: attempt.points
            else if attempt.claimed is false
                attempted[attempt.nugget] = _id: attempt.nugget
        callback null, (obj for key,obj of claimed), (obj for key,obj of attempted)

get_student_probe_scores = (email, callback) ->
    if not email
        return callback null, 0, 0
    db.collection("proberesponse").count email: email, correct: true, (err, correct) =>
        if err then callback err
        db.collection("proberesponse").count email: email, correct: false, (err, incorrect) =>
            if err then callback err
            callback null, correct, incorrect

class StudentStatistics extends AnalyticsHandler
    
    checkPermissions: =>
        if @req.session.email isnt "admin"
            @res.json error: "Must be logged in as admin", 403
            return false
        if @req.method is "GET" then return true
        
    handle_GET: (callback) =>
        users = []
        user_count = 0
        api.db.collection('user').find().each (err, user) =>
            if err then return users.push email: user.email, _id: user._id, claimed: [], attempted: [], _error: err.toString()
            if not user?.email then return
            user_count++
            get_student_nugget_attempts user.email, (err, claimed, attempted) =>
                get_student_probe_scores user.email, (err, correct, incorrect) =>
                    users.push email: user.email, _id: user._id, claimed: claimed, attempted: attempted, correct: correct, incorrect: incorrect, percent: Math.round(100 * correct / (correct + incorrect))
                    if users.length==user_count then callback new api.JSONResponse(users)
                
        
class PreTest extends AnalyticsHandler
    collection: db.collection("pretest")
    
    handle_POST: (callback) =>
        @save_analytics_object @req.body, callback

    handle_GET: (callback) =>
        @collection.find(email: @req.session.email, {limit:1, sort:[['_id', -1]]}).toArray (err, doc) =>
            inc = doc.length and doc[0]?.inc or 0
            callback new api.JSONResponse(inc.toString())

class Midterm extends AnalyticsHandler
    collection: db.collection("midterm")
    
    handle_PUT: (callback) => # choose between the alternate pre-configured test and the claimed nugget test
        unanswered_key = "midterm-unanswered:" + @req.session.email
        claimed_key = "midterm-claimed:" + @req.session.email
        alternate_key = "midterm-alternate:" + @req.session.email
        if @req.body.alternate
            console.log @req.session.email, "opted for the alternate exam"
            redis.rename alternate_key, unanswered_key, (err) =>
                if err then return callback new api.APIError(err)
                return @save_analytics_object @req.body, callback
        else
            console.log @req.session.email, "opted for the claimed exam"
            redis.rename claimed_key, unanswered_key, (err) =>
                if err then return callback new api.APIError(err)
                return @save_analytics_object @req.body, callback
    
    handle_POST: (callback) =>
        answered_key = "midterm-answered:" + @req.session.email
        unanswered_key = "midterm-unanswered:" + @req.session.email
        redis.lrange unanswered_key, -1, -1, (err, id) =>
            if err then return callback new api.APIError(err)
            if id.length != 1
                return callback new api.APIError("No more questions to answer!")
            if id[0]==@req.body.probe
                if @req.body.skipped
                    console.log @req.session.email, "has skipped question", @req.body.probe, @req.body.manual and "manually" or "automatically!!!"
                    redis.rpoplpush unanswered_key, unanswered_key
                else
                    console.log @req.session.email, "has submitted question", @req.body.probe, "with answers", JSON.stringify(@req.body.answers)
                    redis.rpoplpush unanswered_key, answered_key
                return @save_analytics_object @req.body, callback
            else
                return callback new api.APIError("Can only answer/skip the next item in the queue (#{id}).")
    
    handle_GET: (callback) =>
        redis.llen "midterm-answered:" + @req.session.email, (err, progress) =>
            redis.llen "midterm-unanswered:" + @req.session.email, (err, remaining) =>
                if progress == 0 and remaining == 0
                    redis.get "midterm-claimed-points:" + @req.session.email, (err, points) =>
                        callback new api.JSONResponse(points: points)
                else        
                    redis.lrange "midterm-unanswered:" + @req.session.email, 0, -1, (err, unanswered) =>
                        if err then return callback new api.APIError(err)
                        callback new api.JSONResponse(progress: progress, probes: unanswered)

class Final extends AnalyticsHandler
    collection: db.collection("final")
    
    handle_PUT: (callback) => # choose between the alternate pre-configured test and the claimed nugget test
        unanswered_key = "final-unanswered:" + @req.session.email
        claimed_key = "final-claimed:" + @req.session.email
        alternate_key = "final-alternate:" + @req.session.email
        if @req.body.alternate
            console.log @req.session.email, "opted for the alternate exam"
            redis.rename alternate_key, unanswered_key, (err) =>
                if err then return callback new api.APIError(err)
                return @save_analytics_object @req.body, callback
        else
            console.log @req.session.email, "opted for the claimed exam"
            redis.rename claimed_key, unanswered_key, (err) =>
                if err then return callback new api.APIError(err)
                return @save_analytics_object @req.body, callback
    
    handle_POST: (callback) =>
        answered_key = "final-answered:" + @req.session.email
        unanswered_key = "final-unanswered:" + @req.session.email
        redis.lrange unanswered_key, -1, -1, (err, id) =>
            if err then return callback new api.APIError(err)
            if id.length != 1
                return callback new api.APIError("No more questions to answer!")
            if id[0]==@req.body.probe
                if @req.body.skipped
                    console.log @req.session.email, "has skipped question", @req.body.probe, @req.body.manual and "manually" or "automatically!!!"
                    redis.rpoplpush unanswered_key, unanswered_key
                else
                    console.log @req.session.email, "has submitted question", @req.body.probe, "with answers", JSON.stringify(@req.body.answers)
                    redis.rpoplpush unanswered_key, answered_key
                return @save_analytics_object @req.body, callback
            else
                return callback new api.APIError("Can only answer/skip the next item in the queue (#{id}).")
    
    handle_GET: (callback) =>
        redis.llen "final-answered:" + @req.session.email, (err, progress) =>
            redis.llen "final-unanswered:" + @req.session.email, (err, remaining) =>
                if progress == 0 and remaining == 0
                    redis.get "final-claimed-points:" + @req.session.email, (err, points) =>
                        callback new api.JSONResponse(points: points)
                else        
                    redis.lrange "final-unanswered:" + @req.session.email, 0, -1, (err, unanswered) =>
                        if err then return callback new api.APIError(err)
                        callback new api.JSONResponse(progress: progress, probes: unanswered)


runDelayed = (ms, callback) =>
    setTimeout callback, ms

class ProbeResponse extends AnalyticsHandler
    collection: db.collection("proberesponse")
    
    handle_POST: (callback) =>
        data = @req.body
        api.db.collection("probe").find(_id: new ObjectId(data.probe)).toArray (err, probes) =>
            if err then return callback new api.APIError(err)
            if not probes?.length then return callback new api.APIError("Probe could not be found.")
            probe = probes[0]
            correct = true
            for answer in probe.answers
                # console.log answer.correct, (answer._id in data.answers), data.answers, answer._id.toString()
                correct and= ((answer.correct or false) == (answer._id.toString() in data.answers)) # TODO: ahahahahaha
            data.correct = correct
            @save_analytics_object data, (response) =>
                if response.status == 200
                    response.body.probe = probe
                callback response


collections =
    nuggetattempt: NuggetAttempt
    pretest: PreTest
    proberesponse: ProbeResponse
    studentstatistics: StudentStatistics
    midterm: Midterm
    final: Final

module.exports =
    router: router
    db: db
    get_student_nugget_attempts: get_student_nugget_attempts
    get_student_probe_scores: get_student_probe_scores


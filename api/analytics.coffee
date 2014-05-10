mongoskin = require('mongoskin')
async = require('async')
Backbone = require('backbone')
express = require("express")
nodeStatic = require('node-static')
utils = require("./utils.coffee")
fs = require("fs")
redis = require("redis").createClient()

api = require("./api.coffee")

db = mongoskin.db('127.0.0.1/analytics?auto_reconnect')
ObjectId = db.bson_serializer.ObjectID

routing_pattern = '/:collection([a-z]+)/'
Backbone.Model.prototype.idAttribute = "_id"

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
        # return callback new api.APIError("No can do. Time is up.")
        @save_analytics_object @req.body, (response) =>
            if response.status == 200
                change_user_status @req, @req.session.email, "claimed": response.body, (userstatus) =>
                    response.body.userstatus = userstatus
                    callback response
            else
                callback response

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
        answered_key = "pretest-answered:" + @req.session.email
        unanswered_key = "pretest-unanswered:" + @req.session.email
        redis.lrange unanswered_key, -1, -1, (err, id) =>
            if err then return callback new api.APIError(err)
            if id.length != 1
                return callback new api.APIError("No more questions to answer!")
            if id[0]==@req.body.probe
                console.log @req.session.email, "has submitted question", @req.body.probe, "with answers", JSON.stringify(@req.body.answers)
                redis.rpoplpush unanswered_key, answered_key
                return @save_analytics_object @req.body, callback
            else
                return callback new api.APIError("Can only answer the next item in the queue (#{id}).")
    
    handle_GET: (callback) =>
        redis.llen "pretest-answered:" + @req.session.email, (err, progress) =>
            redis.lrange "pretest-unanswered:" + @req.session.email, 0, -1, (err, unanswered) =>
                if err then return callback new api.APIError(err)
                callback new api.JSONResponse(progress: progress, probes: unanswered)

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

class PostTest extends AnalyticsHandler
    collection: db.collection("posttest")
    
    handle_POST: (callback) =>
        answered_key = "posttest-answered:" + @req.session.email
        unanswered_key = "posttest-unanswered:" + @req.session.email
        redis.lrange unanswered_key, -1, -1, (err, id) =>
            if err then return callback new api.APIError(err)
            if id.length != 1
                return callback new api.APIError("No more questions to answer!")
            if id[0]==@req.body.probe
                console.log @req.session.email, "has submitted question", @req.body.probe, "with answers", JSON.stringify(@req.body.answers)
                redis.rpoplpush unanswered_key, answered_key
                return @save_analytics_object @req.body, callback
            else
                return callback new api.APIError("Can only answer the next item in the queue (#{id}).")
    
    handle_GET: (callback) =>
        redis.llen "posttest-answered:" + @req.session.email, (err, progress) =>
            redis.lrange "posttest-unanswered:" + @req.session.email, 0, -1, (err, unanswered) =>
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
            totalpoints = 0
            earnedpoints = 0
            for answer in probe.answers
                if answer.correct
                    totalpoints += 1
                    if answer._id.toString() in data.answers then earnedpoints += 1
                else
                    if answer._id.toString() in data.answers
                        earnedpoints -= 1
            data.totalpoints = totalpoints
            data.earnedpoints = Math.max(0, earnedpoints)
            data.correct = (totalpoints == earnedpoints)
            #Note calculating this all server side results in a 50% slowdown, but still <1ms on benchmarking
            @save_analytics_object data, (response) =>
                if response.status == 200
                    change_user_status @req, @req.session.email, "review": response.body, (userstatus) =>
                        response.body.userstatus = userstatus
                        callback response
                else
                    callback response


status = api.db.collection("userstatus")
statuslog = db.collection("userstatuslog")
usercollection = api.db.collection("user")

change_user_status = (req, email, diff, callback) =>
    for key, obj of diff
        if obj.check
            check = true
    if not check then return callback null      
    query = email: email
    diff_actions = 
        "set": (data, userstatus) ->
            data

        "review": (data, userstatus) ->
            if not data.earnedpoints then return false
            userstatus.claimed = new Backbone.Collection(userstatus.claimed)
            model = userstatus.claimed.get data.nugget_id
            _id = data.probe
            if model
                timenow = new Date()
                probetimes = model.get "probetimes"
                update = false
                if probetimes
                    if probetimes[_id]
                        if (timenow.getTime() - probetimes[_id].getTime())/1000 > 7*24*60*60
                            update = true
                    else if (timenow.getTime() - model.get("timestamp").getTime())/1000 > 7*24*60*60
                        update = true
                else if (timenow.getTime() - model.get("timestamp").getTime())/1000 > 7*24*60*60
                    update = true
                if update
                    probetimes = probetimes or {}
                    userstatus.shield = Math.min(100, userstatus.shield + data.earnedpoints)
                    probetimes[_id] = timenow
                    userstatus.claimed.get(data.nugget_id).set "probetimes": probetimes
                    userstatus.claimed = userstatus.claimed.toJSON()
                    return userstatus
            return false

        "claimed": (data, userstatus) ->
            userstatus.claimed = new Backbone.Collection(userstatus.claimed)
            userstatus.partial = new Backbone.Collection(userstatus.partial)
            userstatus.unclaimed = new Backbone.Collection(userstatus.unclaimed)
            if data.unclaimed
                unclaimed = userstatus.claimed.get data.nugget
                userstatus.claimed.remove data.nugget
                userstatus.unclaimed.add unclaimed
            if data.claimed
                if not userstatus.claimed.get data.nugget
                    userstatus.claimed.add _id: data.nugget, points: data.points, timestamp: new Date()
                    userstatus.partial.remove data.nugget
                    if not userstatus.unclaimed.get data.nugget
                        userstatus.shield = Math.min(100, userstatus.shield + data.points*3)
            if data.claimed is false and not userstatus.claimed.get data.nugget
                userstatus.partial.add _id: data.nugget
            userstatus.claimed = userstatus.claimed.toJSON()
            userstatus.partial = userstatus.partial.toJSON()
            userstatus.unclaimed = userstatus.unclaimed.toJSON()
            return userstatus

        "erode": (data, userstatus) ->
            if data.remove
                userstatus.shield -= data.remove
                if userstatus.shield < 0
                    userstatus.life += userstatus.shield
                    userstatus.shield = 0
                console.log userstatus.shield
            return userstatus

    #TODO: Implement Caching of server side Backbone Collections with node-cache. (5x speed up)
    status.findOne query, (err, userstatus) =>
        if err then return callback new api.APIError(err)
        if userstatus
            for key, obj of diff
                data = diff_actions[key] obj, userstatus
                if data
                    if data._id then delete data._id
                    status.update query, data, {safe: true, upsert: true}, (err, updatedstatus) =>
                        if err then return new api.APIError(err)
                        data.timestamp = new Date()
                        data.email = email
                        data.diff = key
                        data.ip = req?.connection?.remoteAddress
                        statuslog.save data, (err, obj) =>
                            if err
                                console.log "User Status logging failed for #{email}"
                        callback data
                else
                    callback null
        else
            callback null

create_user_status = (email, data, callback) =>
    status = api.db.collection("userstatus")
    
    log = db.collection("userstatuslog")
    query = email: email
    usercollection.findOne query, (err, user_exists) =>
        if user_exists
            status.findOne query, (err, userstatus) =>
                if err then return callback new api.APIError(err)
                if userstatus
                    console.log "User Status for #{email} already exists"
                    callback null
                else
                    if data
                        if data._id then delete data._id
                        data.email = email
                        status.insert data, (err, newstatus) =>
                            newstatus = newstatus[0]
                            if err then return new api.APIError(err)
                            data.timestamp = new Date()
                            data.diff = "new"
                            statuslog.save data, (err, obj) =>
                                if err
                                    console.log "User Status logging failed for #{email}"
                            update_user = $set: {status_id: newstatus._id.toString()}
                            usercollection.update query, update_user, {safe: true, upsert: true}, (err, auth_user) =>
                                if err
                                    console.log err
                                    return new api.APIError(err)
                                callback data
                    else
                        console.log "No data passed for creation of user status"
                        callback null
        else
            console.log "User not found"
            callback null

collections =
    nuggetattempt: NuggetAttempt
    pretest: PreTest
    posttest: PostTest
    proberesponse: ProbeResponse
    studentstatistics: StudentStatistics
    midterm: Midterm
    final: Final

module.exports =
    router: router
    db: db
    get_student_nugget_attempts: get_student_nugget_attempts
    get_student_probe_scores: get_student_probe_scores
    change_user_status: change_user_status
    create_user_status: create_user_status

_ = require("underscore")
async = require("async")
analytics = require("../api/analytics")
api = require("../api/api")
redis = require("redis").createClient()
undergrads = require("./students.coffee")

nuggetprobes = {}

api.db.collection("course").findOne _id: new api.ObjectId("4f78e9a5e6ef81971e000001"), (err, course) =>
    
    course.nuggets.forEach (nugget) =>
        nuggetprobes[nugget._id] = (probe._id.toString() for probe in (nugget.examquestions or []))

    async.forEachSeries undergrads, reset_user_midterm, quit
        

reset_user_midterm = (email, callback) =>
    console.log "Processing", email
    api.db.collection("userstatus").findOne email: email, (err, status) =>
        if err
            console.log "Error getting stats for", email, err
            return
        
        claimednuggets = status.claimed
        claimed = []
        points = 0
        claimednuggets.forEach (nugget) =>
            points += nugget.points
            claimed.push.apply claimed, nuggetprobes[nugget._id]
        if claimed.length != _.uniq(claimed).length
            console.log "DUPLICATES!!!", email, claimed.length, _.uniq(claimed).length
        
        claimed = _.shuffle(claimed)
        
        answered_key = "midterm-answered:" + email
        unanswered_key = "midterm-unanswered:" + email
        claimed_key = "midterm-claimed:" + email
        
        redis.set "midterm-claimed-points:" + email, points
        
        redis.del answered_key, unanswered_key, claimed_key, =>
            claimed.forEach (probe) =>
                redis.lpush claimed_key, probe
            console.log "completed", email
            callback()
        
quit = (err) ->
    if err then console.log err else process.exit()
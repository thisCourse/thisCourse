_ = require("underscore")
async = require("async")
analytics = require("../api/analytics")
api = require("../api/api")
redis = require("redis").createClient()
undergrads = require("./students.coffee")

# undergrads = ['test']

probes = []

    
api.db.collection("course").findOne _id: new api.ObjectId("4f78e9a5e6ef81971e000001"), (err, course) =>
    
    for nugget in course.nuggets
        if nugget._id == "514df2ae400a59290a000054" then nougat = nugget
    
    nougat.probeset.forEach (probe) =>
        probes.push(probe._id.toString())

    console.log probes

    undergrads.forEach (email) =>
        console.log "Processing", email

        answered_key = "posttest-answered:" + email
        unanswered_key = "posttest-unanswered:" + email
        
        redis.del answered_key, unanswered_key, =>
            probes.forEach (probe) =>
                redis.lpush unanswered_key, probe
            console.log "completed", email
        

# for n in app.get("course").get("nuggets").models
#     if not n.get("title")
#         console.log JSON.stringify (p.id for p in n.get("probeset").models)
#         break



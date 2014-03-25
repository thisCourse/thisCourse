_ = require("underscore")
async = require("async")
api = require("../api/api")
fs = require("fs")

date = new Date()

initstamp = date.getDate()

stream = fs.createWriteStream("pretest_questions" + initstamp)

stream.write "{\n"

api.db.collection("course").findOne _id: new api.ObjectId("4f78e9a5e6ef81971e000001"), (err, course) =>
    
    for nugget in course.nuggets
        if nugget._id.toString() == "514df2ae400a59290a000054"
            nugget.probeset.forEach (probe) =>
                id = probe._id.toString()
                if id.length isnt 24
                    console.log id.length, id, typeof id
                    return
                api.db.collection("probe").findOne _id: new api.ObjectId(id), (err, fullprobe) =>
                    console.log JSON.stringify(fullprobe)
                    stream.write JSON.stringify(fullprobe) + ",\n"

close = (filestream) =>
    console.log "Closing"
    filestream.write "}"

setTimeout close(stream), 10000

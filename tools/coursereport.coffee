_ = require("underscore")
async = require("async")
analytics = require("../api/analytics")
api = require("../api/api")
redis = require("redis").createClient()
students = require("./students.coffee")
fs = require("fs")
year = "2013"

stream = fs.createWriteStream('coursereport_' + year + ".csv")

studynuggets = []

studentdata = {}

students.forEach (email) ->
    studentdata[email] = {}

api.db.collection("course").findOne _id: new api.ObjectId("4f78e9a5e6ef81971e000001"), (err, course) =>
    
    course.nuggets.forEach (nugget) =>
        if nugget.tag != undefined
            if (/L0[0-9]{2}/.test(tag) for tag in nugget.tags).some((item) -> item)
                studynuggets.push(nugget._id)

compileData = =>
        
    students.forEach (email) ->
        analytics.get_student_nugget_attempts email, (err, claimed, attempted) ->
            total = 0
            claimed.forEach (nugget) ->
                if nugget._id in studynuggets then total += nugget.points
            studentdata[email]["finalclaimedpoints"] = total


    api.db.collection("grade").find(email: {$in: students}, title: "Midterm").toArray (err, grades) =>
        grades.forEach (grade) =>
            studentdata[grade.email]["midtermpoints"] = grade.points
            studentdata[grade.email]["midtermgrade"] = grade.grade

    students.forEach (email) ->
        analytics.db.collection("pretest").find(email: email).toArray (err,responses) =>
            studentdata[email]["pretest"] = (responses.length == 35)
            
    students.forEach (email) ->
        analytics.db.collection("posttest").find(email: email).toArray (err,responses) =>
            studentdata[email]["posttest"] = (responses.length == 35)

writeData = =>
    stream.write "Email, Midterm Points, Midterm Grade, Pretest Complete, Posttest Complete, Final Claimed Points\n"
    for email, data of studentdata
        stream.write email + "," + data.midtermpoints + "," + data.midtermgrade + "," + data.pretest + "," + data.posttest + "," + data.finalclaimedpoints + "\n"

setTimeout compileData, 5000

setTimeout writeData, 90000


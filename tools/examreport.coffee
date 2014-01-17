_ = require("underscore")
async = require("async")
analytics = require("../api/analytics")
api = require("../api/api")
redis = require("redis").createClient()
students = require("./students.coffee")
fs = require("fs")
exam = "Midterm"

stream = fs.createWriteStream('examreport_' + exam + ".csv")

stream.write "Email, Points, Grade\n"

api.db.collection("grade").find(email: {$in: students}, title: exam).toArray (err, grades) =>
    grades.forEach (grade) =>
        stream.write grade.email + "," + grade.points + "," + grade.grade + "\n"
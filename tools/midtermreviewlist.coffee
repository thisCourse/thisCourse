_ = require("underscore")
async = require("async")
analytics = require("../api/analytics")
api = require("../api/api")
redis = require("redis").createClient()
students = require("./students.coffee")
# students = ["test", "admin"]

probenuggets = {}

api.db.collection("course").findOne _id: new api.ObjectId("4f78e9a5e6ef81971e000001"), (err, course) =>    
    course.nuggets.forEach (nugget) =>
        if nugget.examquestions
            nugget.examquestions.forEach (probe) =>
                id = probe._id.toString()
                if id.length isnt 24
                    console.log id.length, id, typeof id
                    return
                probenuggets[id] = nugget._id.toString()

midtermgradeboundaries = [97,93,90,87,83,80,77,73,70,67,63,60,0]

grades = ['A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','F']

addGrades = =>
    analytics.db.collection("midterm").group(
        {email:true}
        {type:"proberesponse"}
        {csum:0,count:0,score:0, maxscore:0}
        (obj,prev) -> 
            prev.csum+=obj.responsetime
            prev.count++
            prev.score+=obj.points
            prev.maxscore+=obj.totalanswerscorrect
        (out) ->
            out.avg_time = out.csum/out.count
            out.percent = out.score/out.maxscore
        (err, people) =>
            for person in people
                if person.email in students
                    grade = grades[(person.score>=x for x in midtermgradeboundaries).indexOf(true)]
                    api.db.collection("grade").save points: person.score, grade: grade, email: person.email, title: "Midterm"       
    )


removeGrades = =>
    for student in students
        console.log "Removing ",student
        api.db.collection("grade").remove(email: student)

showGrades = =>
    for student in students
        api.db.collection("grade").find(email: student).toArray (err, grades) =>
            grades.forEach (grade) =>
                console.log grade

    
setTimeout addGrades, 5000
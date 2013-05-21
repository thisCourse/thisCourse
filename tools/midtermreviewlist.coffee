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

addGrades = =>
    analytics.db.collection("midterm").group(
        {email:true}
        {type:"proberesponse"}
        {csum:0,count:0,score:0, maxscore:0, review: []}
        (obj,prev) -> 
            prev.csum+=obj.responsetime
            prev.count++
            prev.score+=obj.points
            prev.maxscore+=obj.totalanswerscorrect
            if obj.points < obj.totalanswerscorrect then prev.review.push probenuggets[obj.probe]
        (out) ->
            out.avg_time = out.csum/out.count
            out.percent = out.score/out.maxscore
            out.grade = grades[(out.score>=x for x in midtermgradeboundaries).indexOf(true)]
            out.review = _.uniq(out.review)
        (err, people) =>
            for person in people
                if person.email in students
                    grade = grades[(person.score>=x for x in midtermgradeboundaries).indexOf(true)]
                    api.db.collection("grade").save points: person.score, grade: grade, email: person.email, review: person.review, title: "Midterm"
                
    )
    
setTimeout addGrades, 5000
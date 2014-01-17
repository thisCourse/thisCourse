_ = require("underscore")
async = require("async")
analytics = require("../api/analytics")
api = require("../api/api")
redis = require("redis").createClient()

undergrads = []

probeanswers = {}

api.db.collection("course").findOne _id: new api.ObjectId("4f78e9a5e6ef81971e000001"), (err, course) =>    
    course.nuggets.forEach (nugget) =>
        nugget.probeset.forEach (probe) =>
            id = probe._id.toString()
            if id.length isnt 24
                console.log id.length, id, typeof id
                return
            api.db.collection("probe").findOne _id: new api.ObjectId(id), (err, fullprobe) =>
                probeanswers[id] = fullprobe.answers
                # if not _.isString(probeanswers[id])
                # probeanswers[id] = probeanswers[id]._id
                # else
                    # console.log fullprobe.answers

                # fullprobe.answers.forEach (answer) =>
                #     nuggetpoints[nugget._id] += answer.correct or 0
        

addScores = =>
    analytics.db.collection("midterm").find(type: "proberesponse").toArray (err, midtermresponses) =>
        midtermresponses.forEach (response) =>
            response.totalanswers = probeanswers[response.probe].length
            correct = (answer._id.toString() for answer in probeanswers[response.probe] when answer.correct)
            response.totalanswerscorrect = correct.length
            response.givenanswers = response.answers.length
            response.givenanswerscorrect = _.intersection(response.answers,correct).length
            response.points = Math.max(0, response.givenanswerscorrect - Math.max(0, response.givenanswers - response.totalanswerscorrect))
            # if response.points == 0
            #     console.log (typeof(answer._id) for answer in probeanswers[response.probe]), (typeof(id) for id in response.answers)
            analytics.db.collection("midterm").save(response)

setTimeout addScores, 2000

# // JS: 
# people = db.midterm.group({key: {email: true}, cond: {type: "proberesponse"}, initial: {points: 0, max: 0}, reduce: function(response, agg) {agg.points += response.points; agg.max += response.totalanswerscorrect;}, finalize: function(agg) {agg.percent = 100 * agg.points / agg.max;}})

# # coffee
# top = (person for person in people when person.points > 250)


midtermgradeboundaries = [188,180,174,168,160,157,154,150,147,137,0]

grades = ['A+','A','A-','B+','B','B-','C+','C','C-','D','F']

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
        out.grade = grades[(out.score>=x for x in midtermgradeboundaries).indexOf(true)]
    (err, people) =>
        for person in people
            if person.score < 100 then continue
            if person.email=="xxx@ucsd.edu"
                grade = grades[(person.score>=x for x in midtermgradeboundaries).indexOf(true)]
                api.db.collection("grade").save points: person.score, grade: grade, email: person.email, title: "Midterm"
            
)

#mongoexport --db analytics --collection midterm -q '{"type":"proberesponse"}' -o midterm.json --jsonArray

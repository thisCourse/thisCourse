analytics = require("./api/analytics")

correct = {}
incorrect = {}

analytics.db.collection("proberesponse").find(timestamp: {$gte: new Date("May 1, 2012")}).toArray (err, questions) =>
    for q in questions
        if q.correct
            correct[q.probe] = (correct[q.probe] or 0) + 1
        else
            incorrect[q.probe] = (incorrect[q.probe] or 0) + 1
    review = {}
    for id,count of incorrect
        if count > 100
            review[id] = count
    console.log review

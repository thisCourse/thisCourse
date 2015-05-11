_ = require("underscore")
async = require("async")
analytics = require("../api/analytics")
#students = require("./students.coffee")
students = ["raj", "testing", "someoneelse", "another", "This", "that"]

data =
    life: 100
    shield: 70
    claimed: []
    partial: []
    unclaimed: []
    enabled: true
    target: 250

generate = (email, callback) =>
    analytics.create_user_status email, data, (status) =>
        if status
            console.log "Generated status for #{status.email}"
        else
            console.log "Failed to generate status for #{email}"
        callback()

quit = (err) ->
    if err then console.log err else process.exit()

async.forEachSeries(students, generate, quit)

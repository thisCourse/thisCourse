async = require("async")
analytics = require("../api/analytics")

students = ["test"]


erode = (student, callback) ->
    analytics.change_user_status {}, student, "erode": {"remove": 10}, =>
        console.log "Eroded #{student} status"
        callback()


quit = (err) ->
    if err then console.log err else process.exit()

async.forEach(students, erode, quit)
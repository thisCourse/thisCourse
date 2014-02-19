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
        if nugget._id == "514df2ae400a59290a000054"
	        nugget.probeset.forEach (probe) =>
		    	stream.write JSON.stringify(probe) + ",\n"

close = (filestream) =>
	filestream.write "}"

setTimeout close, 5000
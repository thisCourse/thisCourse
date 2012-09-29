secrets = require("../secrets")

postmark = require("postmark")(secrets.postmarkAPIKey)

module.exports.send = (options, callback) ->

    options["From"] or= "help@thiscourse.com"

    # {
    #     "To": "jamalex@gmail.com", 
    #     "Subject": "Test", 
    #     "TextBody": "Test Message"
    # }

    postmark.send(options, callback)
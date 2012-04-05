postmark = require("postmark")("717c0cea-5b32-4fce-ae41-91cb38aa4f69")

module.exports.send = (options) ->

    options["From"] or= "help@thiscourse.com"

    # {
    #     "To": "jamalex@gmail.com", 
    #     "Subject": "Test", 
    #     "TextBody": "Test Message"
    # }

    postmark.send(options)
module.exports.send = (options) ->

    options["From"] or= "help@thiscourse.com"

    # {
    #     "To": "jamalex@gmail.com", 
    #     "Subject": "Test", 
    #     "TextBody": "Test Message"
    # }

    postmark.send(options)
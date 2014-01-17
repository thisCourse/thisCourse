auth = require("../auth.coffee")
crypto = require("crypto")
emailer = require("../api/email.coffee")

qqqe = []

students = []

gradstudents = []

students.forEach (email) => 
    shasum = crypto.createHash('sha1')
    shasum.update(email)
    password = shasum.digest("hex")
    auth.create_user email, password, (err, user) =>
        if not err
            console.log "User successfully created:", email, "(password:" + password + ")"        
        else
            console.log "Error creating user", email, "(" + err + ")"
    body = """
        Dear student,

        Welcome to COGS107C! We've created an account for you to login to the website. For now, we've chosen a password for you, but later you'll be able to change it to your own password.

        Email: #{email}
        Password: #{password}

        The website is at: http://cogs107c.thiscourse.com/course/

        Please let us know if you have any troubles logging in. The link for the pretest will be sent to you later tonight.

        Sincerely,
        Your instructors.
        """
    
    emailer.send TextBody: body, To: email, Subject: "Welcome to COGS107C! (login details inside)", =>
        console.log "Email sent to", email
    
    
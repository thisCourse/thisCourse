auth = require("../auth.coffee")
crypto = require("crypto")
emailer = require("../api/email.coffee")
students = require("./students.coffee")

students.forEach (email) => 
    shasum = crypto.createHash('sha1')
    shasum.update(email)
    password = shasum.digest("hex").slice(5,13)
    auth.create_user email, password, (err, user) =>
        if not err
            console.log "User successfully created:", email, "(password:" + password + ")"        
        else
            console.log "Error creating user", email, "(" + err + ")"
    body = """
        Dear student,

        Welcome to COGS107C! We've created an account for you to login to the website. We've chosen a password for you, please keep a record of it.

        Email: #{email}
        Password: #{password}

        The website is at: http://cogs107c.thiscourse.com/course/

        Please let us know if you have any troubles logging in. The pretest will be available when you login. Please complete it by class time on Wednesday morning.

        Sincerely,
        The thisCourse team.
        """
    
    emailer.send TextBody: body, To: email, Subject: "Welcome to COGS107C! (login details inside)", =>
        console.log "Email sent to", email
    
    
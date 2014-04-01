emailer = require("../api/email.coffee")
analytics = require("../api/analytics")
api = require("../api/api")
students = require("./students.coffee")


midtermgradeboundaries = [180,160,150,140,0]

grades = ['A','B','C','D','F']    

student.forEach (email) =>
    console.log "Processing", email
    analytics.get_student_nugget_attempts email, (err, claimed, attempted) =>
        if err
            console.log "Error getting stats for", email, err
            return
        points = (nugget.points for nugget in claimed).reduce ((t, s) -> t + s), 0
        sendEmail email: email, points: points, grade: grades[(points>=x for x in midtermgradeboundaries).indexOf(true)]

sendEmail = (student) ->  
    
    body = """
        Dear student,

        As you are no doubt aware, you are able to choose the content of your Midterm and Final exams by your activity on the course website.

        You are receiving this email to inform you of your current standing in nuggets, and the maximum grade that you will be able to achieve in the Midterm exam you have constructed.

        Total points for nuggets claimed so far: #{student.points}
        
        If you answer all of these questions correctly on the exam, you will get a grade of #{student.grade} on your Midterm exam.
        
        Remember, the grade you receive on the midterm is determined by the number of points you answer correctly on the exam. You will get one point for every correct answer (including partial credit for questions) - however, selecting too many answers will be penalized.
        
        On the day of the test, questions from any nuggets you have claimed will appear on your midterm exam. If you have claimed nuggets that you do not wish to appear on your midterm exam, please use the 'Unclaim' feature - this button can be found on the page for the particular nugget you wish to unclaim.
        
        All nugget claiming/unclaiming must be done by midnight on Wednesday in order for your nuggets to be included in the exam. You will be able to continue to practice for your exam up until 1 hour before the exam starts (1pm).
        
        Due to the experimental nature of the class, the option of a traditional (but still computerized) midterm on Lectures 1-9 will be available at the time of the exam. [If you choose this option, this would be a subset of the material from Lectures 1-9 (totalling 200 points), however you would have no control over which questions you are asked, and which material from these lectures is covered.]
        
        As a reminder, these are the total points you need to correctly answer on your Midterm exam for different grades:
        
        180+ - A
        
        160-179 - B
        
        150-159 - C
        
        140 - 149 - D
        
        Finally, if you have not received an email from one of the instructors regarding special accommodations, power requirements, or access to a computer during the exam, and you require any of these, you must contact us before the end of the day.
        
        Unless we have been notified otherwise by you, it is assumed that you will arrive at the exam with a laptop capable of sustaining power for the full 80 minutes of the midterm.

        Sincerely,
        Your instructors.
        """
    
    emailer.send TextBody: body, To: student.email, Subject: "COGS107c Midterm Maximum Projected Grade", =>
        console.log "Email sent to", student.email, "(Points: " + student.points + ")"
    
    
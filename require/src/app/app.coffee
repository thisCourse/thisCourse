define ["cs!utils/handlebars", "cs!./models", "cs!course/models"], \
        (handlebars, models, coursemodels) ->

    console.log "starting app"

    window.app = new models.AppModel
        root_url: window.root_url? or (window.location.pathname.split("/")[1] + "/")

    # c = new (require("cs!course/models").CourseModel); c.save().success(function() { console.log(c.id); })
    app.set course: new coursemodels.CourseModel(_id: course_id)
    
    app.get("tabs").add title: "Home", slug: "", priority: 0
    app.get("tabs").add title: "Study", slug: "study", priority: 1
    app.get("tabs").add title: "Nuggets", slug: "nuggets", priority: 2
    app.get("tabs").add title: "Chat", slug: "chat", priority: 3 #, classes: "logged-in-only"
    
    app.get("course").fetch().success =>
        console.log "fetched!"
        #app.course.set app.course.attributes
    
    return app

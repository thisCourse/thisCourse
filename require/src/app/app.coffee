define ["cs!utils/handlebars", "cs!./models", "cs!course/models"], \
        (handlebars, models, coursemodels) ->

    console.log "starting app"

    window.app = new models.AppModel
        root_url: window.root_url? or (window.location.pathname.split("/")[1] + "/")

    app.course = new coursemodels.CourseModel
        _id: course_id # "4f78bd1869f23aaa0f000007" # c = new (require("cs!course/models").CourseModel); c.save().success(function() { console.log(c.id); })
    
    app.course.fetch().success =>
        console.log "fetched!"
        #app.course.set app.course.attributes
    
    return app

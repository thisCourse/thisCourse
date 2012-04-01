define ["cs!utils/handlebars", "cs!./router", "cs!course/models"], \
        (handlebars, router, coursemodels) ->

    console.log "starting app"

    class AppModel extends Backbone.Model

        constructor: (options) ->
            @router = new router.BaseRouter
                root_url: options.root_url or "/"
                app: @

        navigate: (url) =>
            if not url then return
            if url instanceof Function then url = url()
            if url.slice(-1) != "/"
                url += "/"    
            @router.navigate url, true

        start: ->
            @router.start()
            Backbone.history.start pushState: true

    window.app = new AppModel
        root_url: window.location.pathname.split("/")[1] + "/"

    app.course = new coursemodels.CourseModel
        _id: "4f78a20686d207630c000001" # c = new (require("cs!course/models").CourseModel); c.save().success(function() { console.log(c.id); })
    
    app.course.fetch().success =>
        console.log "fetched!"
        #app.course.set app.course.attributes
    
    return app

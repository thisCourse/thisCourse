define ["cs!utils/handlebars", "cs!./router", "cs!course/models"], (handlebars, router, coursemodels) ->

    console.log "starting app"

    class AppModel extends Backbone.Model

        defaults:
            tabs:
                "": "Home"
                "lectures": "Lectures"
                "assignments": "Assignments"

        constructor: (options) ->
            @router = new router.BaseRouter
                root_url: options.root_url or "/"
                app: @

        navigate: (url) =>
            if not url then return
            if url.slice(-1) != "/"
                url += "/"    
            @router.navigate url, true

        start: ->
            @router.start()
            Backbone.history.start pushState: true

    window.app = new AppModel
        root_url: window.location.pathname.split("/")[1] + "/"

    app.course = new coursemodels.CourseModel
        assignments: [
            {
                title: "Tha firsty!"
                _id: 17
            }
            {
                title: "Tho secondy..."
                _id: 19
            }
        ]

    return app

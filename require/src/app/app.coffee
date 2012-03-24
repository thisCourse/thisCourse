define ["cs!./router", "cs!course/models"], (router, coursemodels) ->

    console.log "starting app"

    class AppModel extends Backbone.Model

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
        _id: "999"
        lectures: [
            {
                _id: "1"
                title: "Tha firsty!"
                pages: [
                    {
                        _id: "77"
                        title: "Stuff"
                        html: "yeahhhhhh"
                    }
                    {
                        _id: "33"
                        title: "More"
                        html: "woooooooooo"
                    }
                    {
                        _id: "99"
                        title: "Yes"
                        html: "here it is"
                    }
                ]
            }
            {
                _id: "2"
                title: "Tho secondy..."
                pages: [
                    {
                        _id: "66"
                        title: "Mhmmm"
                        html: "ah yaaa"
                    }
                    {
                        _id: "44"
                        title: "Tuba"
                        html: "barruuuuuuuuuum"
                    }
                    {
                        _id: "88"
                        title: "Angel"
                        html: "Ah yes"
                    }
                ]
            }
        ]

    return app

define ["cs!./router"], (router) ->

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
            Backbone.history.start pushState: true

    app = new AppModel
        root_url: window.location.pathname.split("/")[1] + "/"

    return app

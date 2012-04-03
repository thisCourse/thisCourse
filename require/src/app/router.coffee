define ["cs!./views"], (views) ->

    class BaseRouter extends Backbone.Router
        
        constructor: (options) ->
            @root_url = options.root_url
            @app = options.app
            @app.bind "change:url", (app, url) => @navigate url, true
            super

        start: =>
            @rootview = new views.RootView
                url: "/" + @root_url
                model: @app
            @rootview.render()
            @route @root_url + "*splat", "delegate_navigation", (splat) =>
                if splat.length > 0 and splat.slice(-1) isnt "/" # if the trailing slash was omitted, redirect
                    @app.set url: @root_url + splat + "/"
                else
                    @rootview.navigate splat


    BaseRouter: BaseRouter
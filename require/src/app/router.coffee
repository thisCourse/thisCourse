define ["cs!./views"], (views) ->

    class BaseRouter extends Backbone.Router
        
        constructor: (options) ->
            @root_url = options.root_url
            @app = options.app
            super

        start: =>
            @rootview = new views.RootView
                url: "/" + @root_url
                model: @app.course
            @rootview.render()
            @route @root_url + "*splat", "delegate_navigation", (splat) =>

                if splat.length > 0 and splat.slice(-1) != "/" # if the trailing slash was omitted, redirect
                    @app.navigate @root_url + splat
                else
                    @rootview.navigate splat

    return BaseRouter: BaseRouter
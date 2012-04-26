define ["cs!./views", "cs!analytics/utils"], (views, analyticsutils) ->

    class BaseRouter extends Backbone.Router
        
        constructor: (options) ->
            @root_url = options.root_url
            Handlebars.registerHelper 'root_url', => @root_url
            @app = options.app
            @app.bind "change:url", (app, url, navoptions) =>
                @navigate url, _.extend trigger: true, (navoptions or {})
            analyticsutils.ga_initialize()
            super

        start: =>
            @appview = new views.AppView
                url: @root_url
                model: @app
            @appview.render()
            @route "*splat", "delegate_navigation", (splat) =>
                # alert @root_url + splat
                if splat.length > 0 and splat.slice(-1) isnt "/" # if the trailing slash was omitted, redirect
                    @app.set url: splat + "/"
                else
                    analyticsutils.ga_track_pageview()
                    @appview.navigate splat


    BaseRouter: BaseRouter
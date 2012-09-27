define ["cs!./views", "cs!analytics/utils", "cs!utils/urls"], (views, analyticsutils, urlutils) ->

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
                splitsplat = splat.split("?")
                path = splitsplat[0]
                query = urlutils.getUrlParams(splitsplat[1..].join("?") or "")
                if path.length > 0 and path.slice(-1) isnt "/" # if the trailing slash was omitted, redirect
                    @app.set url: splat.replace(/(\?|$)/, "/$1")
                else
                    analyticsutils.ga_track_pageview()
                    @appview.navigate path, query


    BaseRouter: BaseRouter
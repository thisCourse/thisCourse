define ["cs!./views"], (views, app) ->

    class BaseRouter extends Backbone.Router
        
        initialize: (options) =>
            @rootview = new views.RootView(url: "/" + options.root_url)
            @rootview.render()
            @route options.root_url + "*splat", "delegate_navigation", (splat) =>

                if splat.length > 0 and splat.slice(-1) != "/" # if the trailing slash was omitted, redirect
                    require("cs!app/app").navigate options.root_url + splat
                else
                    @rootview.navigate splat

    return BaseRouter: BaseRouter
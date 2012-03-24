define ["cs!./views"], (views) ->

    class BaseRouter extends Backbone.Router
        
        initialize: (options) =>
            @rootview = new views.RootView(url: "/" + options.root_url)
            @rootview.render()
            @route options.root_url + "*splat", "delegate_navigation", (splat) =>
                if splat.length > 0 and splat.slice(-1) != "/"
                    navigate options.root_url + splat
                else
                    @rootview.navigate splat

    router = new BaseRouter root_url: "coffeetest/"

    window.navigate = (url) ->
        if url.slice(-1) != "/"
            url += "/"    
        router.navigate url, true

    Backbone.history.start pushState: true

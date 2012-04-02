define ['cs!course/models', "cs!./router"], (coursemodels, router) ->
    
    class AppModel extends Backbone.Model

        initialize: (options) ->
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

    #class TabModel extends 

    AppModel: AppModel
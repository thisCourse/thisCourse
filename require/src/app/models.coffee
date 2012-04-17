define ["cs!base/models", "cs!course/models", "cs!auth/models", "cs!./router"], \
        (basemodels, coursemodels, authmodels, router) ->
    
    class AppModel extends basemodels.LazyModel
                
        relations: ->
            course:
                model: coursemodels.CourseModel
                includeInJSON: false
            tabs:
                collection: TabCollection
                includeInJSON: true
            user:
                model: authmodels.UserModel

        initialize: (options={}) ->
            @router = new router.BaseRouter
                root_url: @get("root_url")
                app: @

        navigate: (url) =>
            if not url then return
            if url instanceof Function then url = url()
            url = $("<a href='" + url + "'>")[0].pathname # hack (?) to resolve relative paths (e.g. "..")
            if url.slice(-1) isnt "/" then url += "/"
            @set (url: url), (silent:true) # silent so that we don't trigger twice (see next)
            @trigger "change:url", @, url # hack to make pushstate work well with back buttons

        start: ->
            @router.start()
            Backbone.history.start pushState: true

    class TabModel extends basemodels.LazyModel
        
        initialize: ->
            if @get("slug").slice?(-1) is "/"
                @set slug: @get("slug").slice(0,-1)
        
    class TabCollection extends basemodels.LazyCollection
        model: TabModel
        
        comparator: => @get("priority")

    AppModel: AppModel
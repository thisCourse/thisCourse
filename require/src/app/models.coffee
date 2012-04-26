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

        navigate: (url, options) =>
            if not url then return
            if url instanceof Function then url = url()
            url = "/" + $("<a href='" + url + "'>")[0].pathname.replace(/^\/+/,"") # hack (?) to resolve relative paths (e.g. "..")
            if url.slice(-1) isnt "/" then url += "/"
            root = @get("root_url")
            if url[0...root.length]==root then url = url[root.length...] # trim off the leading root url, if present
            @set (url: url), (silent:true) # silent so that we don't trigger twice (see next)
            @trigger "change:url", @, url, options # hack to make pushstate work well with back buttons

        start: ->
            @router.start()
            Backbone.history.start pushState: true, root: @get("root_url")

    class TabModel extends basemodels.LazyModel
        
        initialize: ->
            if @get("slug").slice?(-1) is "/"
                @set slug: @get("slug").slice(0,-1)
        
    class TabCollection extends basemodels.LazyCollection
        model: TabModel
        
        comparator: => @get("priority")

    AppModel: AppModel
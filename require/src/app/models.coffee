define ["cs!base/models", "cs!course/models", "cs!./router"], (basemodels, coursemodels, router) ->
    
    class AppModel extends basemodels.LazyModel
                
        relations: ->
            course:
                model: coursemodels.CourseModel
                includeInJSON: false
            tabs:
                collection: TabCollection
                includeInJSON: true

        initialize: (options={}) ->
            @router = new router.BaseRouter
                root_url: @get("root_url")
                app: @

        navigate: (url) =>
            if not url then return
            if url instanceof Function then url = url()
            @set url: url

        start: ->
            @router.start()
            Backbone.history.start pushState: true

    class TabModel extends basemodels.LazyModel
        
        initialize: ->
            if @get("slug") and @get("slug").slice(-1) isnt "/"
                @set slug: @get("slug") + "/"
        
    class TabCollection extends basemodels.LazyCollection
        model: TabModel
        
        comparator: => @get("priority")

    AppModel: AppModel
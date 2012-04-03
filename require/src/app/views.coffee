define ["cs!base/views", "cs!course/views", "hb!./templates.handlebars", "less!libs/bootstrap/bootstrap"], (baseviews, courseviews, templates, bootstrap) ->

    class RootView extends baseviews.BaseView

        el: "body"

        render: =>
            @$el.html templates.root @context()
            @add_subview "courseview", new courseviews.CourseView(model: @model.get("course")), "#content"
            @add_subview "toptabsview", new TopTabsView(collection: @model.get("tabs")), "#toptabs"

    class TopTabsView extends baseviews.BaseView

        tagName: "ul"
        className: "pills"

        initialize: ->
            @collection.bind "all", @render
            # @render()
        
        render: =>
            @$el.html templates.top_tabs @context(root_url: @url)
        

    return RootView: RootView
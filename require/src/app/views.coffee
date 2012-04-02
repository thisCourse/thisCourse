define ["cs!base/views", "cs!course/views", "hb!./templates.handlebars", "less!libs/bootstrap/bootstrap"], (baseviews, courseviews, templates, bootstrap) ->

    class RootView extends baseviews.BaseView

        el: "body"

        initialize: =>
            @model.bind("change:title", @updateTitle)

        render: =>
            document.title = "thisCourse"
            @$el.html templates.root @context()
            @add_subview "courseview", new courseviews.CourseView(model: @model), "#content"
            @updateTitle()

        updateTitle: =>
            title = "thisCourse"
            if @model.has("title") then title += " | " + @model.get("title")
            document.title = title

    return RootView: RootView
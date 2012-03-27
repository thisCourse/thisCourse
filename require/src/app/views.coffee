define ["cs!base/views", "cs!course/views", "hb!./templates.handlebars", "less!libs/bootstrap/bootstrap"], (baseviews, courseviews, templates, bootstrap) ->

    class RootView extends baseviews.BaseView

        el: "body"

        render: =>
            @$el.html templates.root @context()
            @add_subview "courseview", new courseviews.CourseView(model: @model), @$("#content")

    return RootView: RootView
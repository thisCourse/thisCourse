define ["cs!base/views", "cs!course/views"], (baseviews, courseviews) ->

    class RootView extends baseviews.BaseView

        el: "body"

        render: =>
            @$el.html "<div class='tabs'></div><div class='contents'></div>"
            @add_subview "courseview", new courseviews.CourseView, @$(".contents")

    return RootView: RootView
define ["cs!base/views", "cs!./models"], (baseviews, models) ->

    class RootView extends BaseView

        el: $("body")

        render: =>
            @$el.html "<div class='tabs'></div><div class='contents'></div>"
            @add_subview "courseview", new CourseView, @$(".contents")

    return
    	RootView: RootView
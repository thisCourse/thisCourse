define ["cs!base/views", "cs!home/views", "cs!lecture/views", "cs!./models"], \
        (baseviews, homeviews, lectureviews, models) ->

    class CourseView extends baseviews.RouterView

        routes: ->
            "": -> new homeviews.HomeView
            "lecture/": -> new lectureviews.LectureRouterView

    return CourseView: CourseView
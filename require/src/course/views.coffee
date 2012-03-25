define ["cs!base/views", "cs!home/views", "cs!lecture/views", "cs!./models"], \
        (baseviews, homeviews, lectureviews, models) ->

    class CourseView extends baseviews.RouterView

        routes: =>
            "": => new homeviews.HomeView model: @model
            "lecture/": => new lectureviews.LectureRouterView collection: @model.get("lectures")

    return CourseView: CourseView
define ["cs!base/views", "cs!home/views", "cs!lecture/views", "cs!assignment/views", "cs!./models"], \
        (baseviews, homeviews, lectureviews, assignmentviews, models) ->

    class CourseView extends baseviews.RouterView

        routes: =>
            "": => new homeviews.HomeView model: @model
            "lecture/": => new lectureviews.LectureRouterView collection: @model.get("lectures")
            "assignment/": => new assignmentviews.AssignmentRouterView collection: @model.get("assignments")

    return CourseView: CourseView
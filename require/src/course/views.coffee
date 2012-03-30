define ["cs!base/views", "cs!home/views", "cs!lecture/views", "cs!assignment/views", "cs!./models"], \
        (baseviews, homeviews, lectureviews, assignmentviews, models) ->

    class CourseView extends baseviews.RouterView

        routes: =>
            "": => view: homeviews.HomeView, datasource: "model"
            "lecture/": => view: lectureviews.LectureRouterView, datasource: "model", key: "lectures"
            "assignment/": => view: assignmentviews.AssignmentRouterView, datasource: "model", key: "assignments"

    return CourseView: CourseView
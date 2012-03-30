define ["cs!base/views", "cs!home/views", "cs!lecture/views", "cs!assignment/views", "cs!nugget/views", "cs!./models"], \
        (baseviews, homeviews, lectureviews, assignmentviews, nuggetviews, models) ->

    class CourseView extends baseviews.RouterView

        routes: =>
            "": => view: homeviews.HomeView, datasource: "model"
            "lecture/": => view: lectureviews.LectureRouterView, datasource: "model", key: "lectures"
            "assignment/": => view: assignmentviews.AssignmentRouterView, datasource: "model", key: "assignments"
            "study/": => view: nuggetviews.NuggetRouterView, datasource: "model", key: "nuggets"

    return CourseView: CourseView
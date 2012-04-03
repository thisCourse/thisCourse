define ["cs!base/views", "cs!home/views", "cs!lecture/views", "cs!assignment/views", "cs!nugget/views", "cs!file/views", "cs!./models"], \
        (baseviews, homeviews, lectureviews, assignmentviews, nuggetviews, fileviews, models) ->

    class CourseView extends baseviews.RouterView

        routes: =>
            "": => view: homeviews.HomeView, datasource: "model"
            "lecture/": => view: lectureviews.LectureRouterView, datasource: "model", key: "lectures"
            "assignment/": => view: assignmentviews.AssignmentRouterView, datasource: "model", key: "assignments"
            "study/": => view: nuggetviews.NuggetRouterView, datasource: "model", key: "nuggets"
            "filebrowse/": => new fileviews.FileBrowserView

        initialize: =>
            @model.bind("change:title", @updateTitle)
            document.title = "thisCourse"
            @updateTitle()

        updateTitle: =>
            title = "thisCourse"
            if @model.has("title") then title += " | " + @model.get("title")
            document.title = title
            


    return CourseView: CourseView
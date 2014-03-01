define ["cs!base/views", "cs!home/views", "cs!lecture/views", "cs!assignment/views", "cs!nugget/views", "cs!chat/views", "cs!analytics/views", "cs!file/views", "cs!probe/views", "cs!grade/views", "cs!./models", "cs!admin/views", "cs!glossary/views"], \
        (baseviews, homeviews, lectureviews, assignmentviews, nuggetviews, chatviews, analyticsviews, fileviews, probeviews, gradeviews, models, adminviews, glossaryviews) ->

    class CourseView extends baseviews.RouterView

        routes: =>
            "": => view: homeviews.HomeView, datasource: "model"
            "lecture/": => view: lectureviews.LectureRouterView, datasource: "model", key: "lectures"
            "assignment/": => view: assignmentviews.AssignmentRouterView, datasource: "model", key: "assignments"
            "study/": => view: nuggetviews.StudyRouterView, datasource: "model", key: "nuggets"
            "nuggets/": => view: nuggetviews.NuggetRouterView, datasource: "model", key: "nuggets"
            "chat/": => view: chatviews.ChatView
            "admin/": => view: adminviews.AdminRouterView
            "glossary/": => view: glossaryviews.GlossaryRouterView, datasource: "model", key: "glossary"
            "midterm/": => view: probeviews.MidtermView
            "final/": => view: probeviews.FinalView
            "pretest/": => view: probeviews.PreTestView
            "posttest/": => view: probeviews.PostTestView
            "grades/": => view: gradeviews.GradesView
            "analytics/": => view: analyticsviews.AnalyticsView
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
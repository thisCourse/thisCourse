define ["cs!base/views", "cs!./models"], (baseviews, models) ->

    class window.CourseView extends RouterView

        routes: ->
            "": -> new HomeView
            "lecture/": -> new LectureRouterView

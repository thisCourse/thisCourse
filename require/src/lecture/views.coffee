define ["cs!base/views", "cs!./models"], (baseviews, models) ->

    class LectureRouterView extends RouterView

        className: "LectureRouterView"

        routes: ->
            "": => new LectureListView
            ":lecture_id/": (lecture_id) => new LectureView id: lecture_id


    class LectureListView extends BaseView

        className: "LectureListView"
        
        render: =>
            html = "<ul>"
            for num in [3,66,75,139]
                html += "<li><a href='" + @url + num + "'>Lecture " + num + "</a></li>"
            html += "</ul>"
            @$el.html html


    class LectureView extends BaseView

        className: "LectureView"
        
        render: =>
            @$el.text "Loading lecture..."
            setTimeout @actually_render, 500

        actually_render: =>
            html = "This is lecture #" + @options.id
            for num in [1,2,3,4,5]
                html += "<li><a href='" + @url + "page/" + num + "/'>Page " + num + "</a></li>"
            html += "</ul>"
            @$el.html html
            @add_subview "pageview", new PageRouterView

    return
    	LectureRouterView: LectureRouterView
    	LectureListView: LectureListView
    	LectureView: LectureView
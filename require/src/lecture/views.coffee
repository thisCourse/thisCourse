define ["cs!base/views", "cs!./models", "cs!page/views"], (baseviews, models, pageviews) ->

    class LectureRouterView extends baseviews.RouterView

        routes: =>
            "": => new LectureListView collection: @collection
            ":lecture_id/": (lecture_id) => new LectureView model: @collection.get(lecture_id)


    class LectureListView extends baseviews.BaseView

        render: =>
            html = "<ul>"
            for lecture in @collection.models
                html += "<li><a href='" + @url + lecture.id + "'>Lecture " + lecture.id + "</a></li>"
            html += "</ul>"
            @$el.html html


    class LectureView extends baseviews.BaseView
        
        render: =>
            @$el.text "Loading lecture..."
            setTimeout @actually_render, 500

        actually_render: =>
            html = "This is lecture #" + @model.id
            console.log @model
            for page in @model.get("pages").models
                html += "<li><a href='" + @url + "page/" + page.id + "/'>Page " + page.id + "</a></li>"
            html += "</ul>"
            @$el.html html
            @add_subview "pageview", new pageviews.PageRouterView collection: @model.get("pages")

    LectureRouterView: LectureRouterView
    LectureListView: LectureListView
    LectureView: LectureView
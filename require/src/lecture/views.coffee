define ["cs!base/views", "cs!./models", "cs!page/views", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, pageviews, templates, styles) ->

    class LectureRouterView extends baseviews.RouterView

        routes: =>
            "": => new LectureListView collection: @collection
            ":lecture_id/": (lecture_id) => new LectureView model: @collection.get(lecture_id)

    class LectureListView extends baseviews.BaseView

        render: =>
            @$el.html templates.lecture_list @context()
            

    class LectureView extends baseviews.BaseView
        
        render: =>
            @$el.text "Loading lecture..."
            setTimeout @actually_render, 500

        actually_render: =>
            html = "This is lecture #" + @model.id + ": " + @model.get("title")
            for page in @model.get("pages").models
                html += "<li><a href='" + @url + "page/" + page.id + "/'>" + page.id + ": " + page.get("title") + "</a></li>"
            html += "</ul>"
            @$el.html html
            #@add_subview "pageview", new pageviews.PageRouterView collection: @model.get("pages")


    LectureRouterView: LectureRouterView
    LectureListView: LectureListView
    LectureView: LectureView
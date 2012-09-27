define ["cs!base/views", "cs!schedule/views", "cs!content/views", "cs!./models", "hb!./templates.handlebars"], \
        (baseviews, scheduleviews, contentviews, models, templates) ->

    class HomeView extends baseviews.BaseView

        initialize: =>
            @model.bind("change:title", @updateTitle)

        render: =>
            @$el.html templates.home @context()
            @add_subview "schedule", new scheduleviews.ScheduleView model: @model, ".schedule"
            @add_lazy_subview name: "content", view: contentviews.ContentView, datasource: "model", key: "content", target: ".content"
            @updateTitle()

        updateTitle: =>
            @$(".home-title").text @model.get("title") or ""


    HomeView: HomeView
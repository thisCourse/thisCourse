define ["cs!base/views", "cs!schedule/views", "cs!content/views", "cs!./models", "hb!./templates.handlebars"], \
        (baseviews, scheduleviews, contentviews, models, templates) ->

    class HomeView extends baseviews.BaseView

        render: =>
            @$el.html templates.home @context()
            @add_subview "schedule", new scheduleviews.ScheduleView model: @model, ".schedule"
            @add_lazy_subview name: "content", view: contentviews.ContentView, datasource: "model", key: "content", target: ".content"


    HomeView: HomeView
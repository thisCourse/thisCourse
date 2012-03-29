define ["cs!base/views", "cs!schedule/views", "cs!content/views", "cs!./models", "hb!./templates.handlebars"], \
        (baseviews, scheduleviews, contentviews, models, templates) ->

    class HomeView extends baseviews.BaseView

        render: =>
            @$el.html templates.home @context()
            @add_subview "schedule", new scheduleviews.ScheduleView model: @model, ".schedule"
            @add_subview "content", new contentviews.ContentView model: @model.get("content"), ".content"


    HomeView: HomeView
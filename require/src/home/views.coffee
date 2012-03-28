define ["cs!base/views", "cs!./models", "hb!./templates.handlebars"], (baseviews, models, templates) ->

    class HomeView extends baseviews.BaseView

        render: =>
            @$el.html templates.home @context()
            @add_subview "schedule", new ScheduleView model: @model, ".schedule"
            @add_subview "content", new ContentView model: @model.get("content"), ".content"


    HomeView: HomeView
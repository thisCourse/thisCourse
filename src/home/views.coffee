define ["cs!base/views", "cs!schedule/views", "cs!content/views", "cs!./models", "hb!./templates.handlebars", "cs!ui/spinner/views"], \
        (baseviews, scheduleviews, contentviews, models, templates, spinnerviews) ->

    class HomeView extends baseviews.BaseView

        initialize: =>
            @model.bind("change:title", @updateTitle)
            @model.bind("loaded", @render)

        render: =>
            if @model.loaded()
                @$el.html templates.home @context()
                @add_subview "schedule", new scheduleviews.ScheduleView model: @model, ".schedule"
                @add_lazy_subview name: "content", view: contentviews.ContentView, datasource: "model", key: "content", target: ".content"
                @updateTitle()
            else
                console.log "Here!"
                @add_subview "spinner", new spinnerviews.SpinnerView model: null, "#content"
                @subviews["spinner"].show()

        updateTitle: =>
            @$(".home-title").text @model.get("title") or ""


    HomeView: HomeView
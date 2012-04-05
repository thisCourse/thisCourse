define ["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, templates, styles) ->


    class AnalyticsView extends baseviews.BaseView
        
        render: =>
            @$el.html templates.boiler @context()


    AnalyticsView: AnalyticsView
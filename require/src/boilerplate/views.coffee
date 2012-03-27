define ["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, templates, styles) ->

    class BoilerRouterView extends baseviews.RouterView

        routes: =>
            "": new BoilerListView collection: @collection
            ":boiler_id/": (boiler_id) => new BoilerView model: @collection.get(boiler_id)

    class BoilerListView extends baseviews.BaseView

        render: =>
            @$el.html templates.boiler_list @context()
            

    class BoilerView extends baseviews.BaseView
        
        render: =>
            @$el.html templates.boiler @context()


    BoilerRouterView: BoilerRouterView
    BoilerListView: BoilerListView
    BoilerView: BoilerView
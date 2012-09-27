define ["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, templates, styles) ->

    class BoilerRouterView extends baseviews.RouterView

        routes: =>
            "": => view: BoilerListView, datasource: "collection"
            ":boiler_id/": (boiler_id) => view: BoilerView, datasource: "collection", key: boiler_id


    class BoilerListView extends baseviews.BaseView

        render: =>
            @$el.html templates.boiler_list @context()
            

    class BoilerView extends baseviews.BaseView
        
        render: =>
            @$el.html templates.boiler @context()


    BoilerRouterView: BoilerRouterView
    BoilerListView: BoilerListView
    BoilerView: BoilerView
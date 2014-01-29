define ["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, templates, styles) ->

    class AdminRouterView extends baseviews.RouterView

        routes: =>
            "": => view: AdminListView, datasource: "collection"
            ":admin_id/": (admin_id) => view: AdminView, datasource: "collection", key: admin_id


    class AdminListView extends baseviews.BaseView

        render: =>
            @$el.html templates.admin_list @context()
            

    class AdminView extends baseviews.BaseView
        
        render: =>
            @$el.html templates.admin @context()


    AdminRouterView: AdminRouterView
    AdminListView: AdminListView
    AdminView: AdminView
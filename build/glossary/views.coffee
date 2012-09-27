define ["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, templates, styles) ->

    class GlossaryRouterView extends baseviews.RouterView

        routes: =>
            "": new GlossaryListView collection: @collection
            ":glossary_id/": (glossary_id) => new GlossaryView model: @collection.get(glossary_id)

    class GlossaryListView extends baseviews.BaseView

        render: =>
            @$el.html templates.glossary_list @context()
            

    class GlossaryView extends baseviews.BaseView
        
        render: =>
            @$el.html templates.glossary @context()


    GlossaryRouterView: GlossaryRouterView
    GlossaryListView: GlossaryListView
    GlossaryView: GlossaryView
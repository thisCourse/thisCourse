define ["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, templates, styles) ->

    class GlossaryRouterView extends baseviews.RouterView

        routes: =>
            # "": new GlossaryListView collection: @collection
            ":glossary_id/": (glossary_id) => new GlossaryView model: @collection.get(glossary_id)

    class GlossaryListView extends baseviews.BaseView

        render: =>
            @$el.html templates.glossary_list @context()
            

    class GlossaryView extends baseviews.BaseView

             
                  
        render: =>
            @$el.html templates.glossary @context()
            @$el.width 172
            if $(@options.target).offset()["left"] < window.innerWidth/2 
                @$el.css "top" , $(@options.target).offset()["top"] #;+ $(options.target).hieght()
                @$el.css "left", $(@options.target).offset()["left"] + $(@options.target).width()
                
            else
                @$el.css "top" , $(@options.target).offset()["top"] #;+ $(options.target).hieght()
                @$el.css "left", $(@options.target).offset()["left"] - @$el.width()
                console.log @$el.width()
            


    GlossaryRouterView: GlossaryRouterView
    GlossaryListView: GlossaryListView
    GlossaryView: GlossaryView
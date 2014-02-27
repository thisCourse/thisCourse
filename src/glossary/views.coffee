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

        initialize: =>
            @model =  app.get("course").get("glossary").get(@options.target.id)
                  
        render: =>
            @$el.html templates.glossary @context()
            @$el.css "opacity", 0
            @$el.children().css "opacity", 0
            _.defer => @resize()
        
        resize: =>
            @$el.css "top" , $(@options.target).position()["top"] + $(@options.target).height()
            @$el.css "left", $(@options.target).position()["left"] + $(@options.target).width()
            
            if (@$el.offset()["left"] + @$el.width()) > $(window).width() 
                difference = (@$el.offset()["left"] + @$el.width()) - $(window).width()
                @$el.css "left", (@$el.position()["left"] - difference)
                
            if (@$el.offset()["top"] + @$el.height()) > $(window).height() 
                difference = (@$el.offset()["top"] + @$el.height()) - $(window).height()
                @$el.css "top", (@$el.position()["top"] - difference)
                
            if @$el.offset()["left"] < 0
                @$el.css "left", (@$el.position()["left"] - @$el.offset()["left"])
                
            if @$el.offset()["top"] < 0
                @$el.css "top", (@$el.position()["top"] - @$el.offset()["top"]) 
                
            @$el.css "opacity", 1
            @$el.children().css "opacity", 0.8


    GlossaryRouterView: GlossaryRouterView
    GlossaryListView: GlossaryListView
    GlossaryView: GlossaryView
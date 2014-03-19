define ["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles","cs!ckeditor/views","cs!ui/dialogs/views"], \
        (baseviews, models, templates, styles,ckeditorviews,dialogviews) ->

    class GlossaryRouterView extends baseviews.RouterView

        routes: =>
            "": => view: GlossaryListView, datasource: "collection"
            ":glossary_id/": (glossary_id) => view: GlossaryEditView, datasource: "collection", key: glossary_id

    class GlossaryListView extends baseviews.BaseView
        
        events:
            "click .add-button": "addNewGlossary"
            
        initialize: =>
            # console.log "init NuggetListView"
            @collection.bind "change", @render
            @collection.bind "remove", @render
            @collection.bind "add", _.debounce @render, 50 # TODO: this gets fired a kazillion times!
        
        render: =>
            @$el.html templates.glossary_list @context()
            console.log @collection
            
        addNewGlossary: =>
            @collection.create {},
                success: (model) => 
                    console.log model
                    require("app").navigate model.get("_id")
            

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
            
            
    class GlossaryEditView extends baseviews.BaseView
        
        minwidth: 12
        
        events:  
            "click .save": "save"
            "click .cancel": "cancel"
        
        render: =>
            @$el.html templates.glossary_edit @context()
            _.defer => $(".ckeditor").ckeditor ckeditorviews.get_config()
            #@add_subview "ckeditor", new ckeditorviews.CKEditorView(html: @model.get("html")), ".html"
    
        save: =>
            console.log @$(".ckeditor").val()
            if @$(".ckeditor").val() == ""
                dialogviews.dialog_confirmation "Creating empty glossary item","Do you really want to save this glossary item?", @finalSave, confirm_button:"Save", cancel_button:"Cancel"
            else
                finalSave()
                
        finalSave: =>                            
            @model.set html: @$(".ckeditor").val(), title: @$(".span12").val()
            # alert @model.get("title")
            @$("input").blur()
            @$(".save.btn").button "loading"
            @model.save {},
                success: =>
                    @$(".save.btn").button "complete"
                    @return()

                error: (model, err) =>
                    msg = "An unknown error occurred while saving. Please try again."
                    switch err.status
                        when 0
                            msg = "Unable to connect; please check internet connectivity and then try again."
                        when 404
                            msg = "The object could not be found on the server; it may have been deleted."
                    @$(".errors").text msg
                    @$(".save.btn").button "complete"

        return: =>
            require("app").navigate @url + ".."
            
        cancel: =>
            if not @model.get("title") and not @model.get("html")
                @model.destroy()
            @return()
            @close()



    GlossaryRouterView: GlossaryRouterView
    GlossaryListView: GlossaryListView
    GlossaryView: GlossaryView
    GlossaryEditView: GlossaryEditView
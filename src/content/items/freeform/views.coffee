define ["cs!../views", "cs!base/views", "cs!ckeditor/views","cs!glossary/views","hb!./templates.handlebars", "less!./styles"], \
        (itemviews, baseviews, ckeditorviews, glossaryviews, templates, styles) ->

    class FreeformItemEditView extends itemviews.ItemEditInlineView
        
        minwidth: 12
        
        render: =>
            super
            @$el.html templates.item_freeform_edit @context()
            _.defer => $(".ckeditor").ckeditor ckeditorviews.get_config()
            #@add_subview "ckeditor", new ckeditorviews.CKEditorView(html: @model.get("html")), ".html"
    
        save: =>
            @model.set html: @$(".ckeditor").val()
            super

        close: =>
            # @$(".ckeditor").ckeditorGet().destroy() # this is commented out because it breaks the editor upon second load
            super
    class FreeformItemDisplayView extends itemviews.ItemDisplayView

        initialize: ->
            @model.set width: Math.min(15, @model.parent.model.get("width"))
            super

        events:
            "mouseover glossary" : "showDef" 
            "click .close-button" : "closeGlossary"
        render: =>
            # console.log "rendering freeform itemview"
            super
            @$el.html templates.item_freeform @context()
            
        showDef: (ev) =>
            console.log ev.target.id
            console.log ev.target 
            if "glossaryItem_" + ev.target.id in Object.keys(@subviews)
                return
            else
                for key, subview of @subviews
                    @close_subview(key)
                @add_subview "glossaryItem_" + ev.target.id, new glossaryviews.GlossaryView(target: ev.target), ".glossary-placeholder"
                console.log "glossaryItem_" + ev.target.id

        closeGlossary: =>
            for key,subview of @subviews
                @close_subview(key)
            
    class FreeformItemView extends itemviews.ItemView    
        EditView: FreeformItemEditView
        DisplayView: FreeformItemDisplayView
    
    
    title: "Freeform"
    description: "Arbitrary content in an editor (visual, or HTML source)"
    ItemView: FreeformItemView
    
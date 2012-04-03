define ["cs!../views", "cs!base/views", "cs!ckeditor/views", "hb!./templates.handlebars", "less!./styles"], \
        (itemviews, baseviews, ckeditorviews, templates, styles) ->

    class FreeformItemEditView extends itemviews.ItemEditInlineView
        
        minwidth: 12
        
        #class: "item item-freeform"
        
        render: =>
            # console.log "rendering freeform itemeditview"
            super
            @$el.html templates.item_freeform_edit @context()
            _.defer => $(".ckeditor").ckeditor ckeditorviews.get_config()
            #@add_subview "ckeditor", new ckeditorviews.CKEditorView(html: @model.get("html")), ".html"
    
        save: =>
            @model.set html: @$(".ckeditor").val()
            super

        close: =>
            #@$(".ckeditor").ckeditorGet().destroy()
            super

    class FreeformItemView extends itemviews.ItemView

        EditView: FreeformItemEditView

        initialize: ->
            @model.set width: Math.min(15, @model.parent.model.get("width"))
            super

        render: =>
            # console.log "rendering freeform itemview"
            super
            @$('.item-inner').html templates.item_freeform @context()
            

    
    title: "Freeform"
    description: "Arbitrary content in an editor (visual, or HTML source)"
    ItemView: FreeformItemView
    ItemEditView: FreeformItemEditView
    
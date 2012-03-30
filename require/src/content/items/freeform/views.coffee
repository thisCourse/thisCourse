define ["cs!../views", "cs!base/views", "cs!ckeditor/views", "cs!../../models", "hb!./templates.handlebars", "less!./styles"], \
        (itemviews, baseviews, ckeditorviews, contentmodels, templates, styles) ->

    class FreeformItemEditView extends itemviews.ItemEditInlineView
        
        minwidth: 12
        
        render: =>
            super
            @$el.html templates.item_freeform_edit @context()
            _.defer => $(".ckeditor").ckeditor ckeditorviews.config
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
            @model.set width: 14 #Math.min(15, @model.get("parent").get("width"))
            super

        render: =>
            @$el.html templates.item_freeform @context()
            super

    
    title: "Freeform"
    description: "Arbitrary content in an editor (visual, or HTML source)"
    ItemView: FreeformItemView
    ItemEditView: FreeformItemEditView
    
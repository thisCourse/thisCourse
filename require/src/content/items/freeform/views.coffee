define ["cs!../views", "cs!base/views", "cs!ckeditor/views" "cs!../../models", "hb!./templates.handlebars", "less!./styles"], \
        (itemviews, baseviews, contentmodels, templates, styles) ->

    class FreeformItemEditView extends itemviews.ItemEditInlineView
        
        minwidth: 12
        
        render: =>
            super
            @$el.html templates.item_freeform_edit @context()
            @add_subview "ckeditor", ckeditorviews.CKEditorView html: @model.get("html"), ".html"
    
        save: =>
            @model.set html: @subviews.ckeditor.html()
            super

        close: =>
            @$(".ckeditor").ckeditorGet().destroy()
            super

    class FreeformItemView extends itemviews.ItemView

        EditView: FreeformItemEditView

        initialize: ->
            @model.set width: Math.min(15, @model.get("parent").get("width"))
            super

        render: =>
            super
            @$el.html templates.item_freeform @context()

    
    title: "Freeform"
    description: "Arbitrary content in an editor (visual, or HTML source)"
    ItemView: FreeformItemView
    ItemEditView: FreeformItemEditView
    
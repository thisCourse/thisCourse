define ["cs!../views", "cs!base/views", "cs!../../models", "hb!./templates.handlebars", "less!./styles"], \
        (itemviews, baseviews, contentmodels, templates, styles) ->

    class FreeformItemView extends itemviews.ItemView

        render: =>
            @$el.html templates.item_freeform @context()
            

    class FreeformItemEditView extends itemviews.ItemEditInlineView # or ItemEditPopupView
        
        render: =>
            @$el.html templates.item_freeform_edit @context()

    
    title: "Freeform"
    description: "Arbitrary content in an editor (visual, or HTML source)"
    ItemView: FreeformItemView
    ItemEditView: FreeformItemEditView
    
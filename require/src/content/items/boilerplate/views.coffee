define ["cs!../views", "cs!base/views", "cs!../../models", "hb!./templates.handlebars", "less!./styles"], \
        (itemviews, baseviews, contentmodels, templates, styles) ->            

    class ProbeItemEditView extends itemviews.ItemEditInlineView # or ItemEditPopupView
        
        render: =>
            @$el.html templates.item_Probe_edit @context()

    class ProbeItemView extends itemviews.ItemView

        EditView: ProbeItemEditView

        render: =>
            @$el.html templates.item_Probe @context()


    title: "Probe"
    description: "Container for 'Probe' data"
    ItemView: ProbeItemView
    ItemEditView: ProbeItemEditView
    
define ["cs!../views", "cs!base/views", "cs!../../models", "hb!./templates.handlebars", "less!./styles"], \
        (itemviews, baseviews, contentmodels, templates, styles) ->            

    class BoilerItemEditView extends itemviews.ItemEditInlineView # or ItemEditPopupView
        
        render: =>
            @$el.html templates.item_boiler_edit @context()

    class BoilerItemView extends itemviews.ItemView

        EditView: BoilerItemEditView

        render: =>
            @$el.html templates.item_boiler @context()


    title: "Boiler"
    description: "Container for 'Boiler' data"
    ItemView: BoilerItemView
    ItemEditView: BoilerItemEditView
    
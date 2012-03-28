define ["cs!base/views", "hb!./templates.handlebars"], (baseviews) ->

    class ItemView extends baseviews.BaseView

    class ItemEditView extends baseviews.BaseView
        
    class ItemEditInlineView extends ItemEditView
        
    class ItemEditPopupView extends ItemEditView


    ItemView: ItemView
    ItemEditView: ItemEditView
    ItemEditInlineView: ItemEditInlineView
    ItemEditPopupView: ItemEditPopupView
    
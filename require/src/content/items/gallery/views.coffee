define ["cs!../views", "cs!base/views", "cs!../../models", "hb!./templates.handlebars", "less!./styles"], \
        (itemviews, baseviews, contentmodels, templates, styles) ->

    class GalleryItemView extends itemviews.ItemView

        render: =>
            @$el.html templates.item_gallery @context()
            

    class GalleryItemEditView extends itemviews.ItemEditInlineView
        
        render: =>
            @$el.html templates.item_gallery_edit @context()

    
    title: "Gallery"
    description: "A gallery of photos, with expandable thumbnails"
    ItemView: GalleryItemView
    ItemEditView: GalleryItemEditView
    
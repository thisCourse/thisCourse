define ["cs!../views", "cs!base/views", "cs!../../models", "hb!./templates.handlebars", "less!./styles"], \
        (itemviews, baseviews, contentmodels, templates, styles) ->

    class GalleryItemEditView extends itemviews.ItemEditInlineView
        
        minwidth: 4

        render: =>
            @$el.html templates.item_gallery_edit @context()
            @bind_data()
            
            # super
            @enablePlaceholders()
            @$("iframe.uploader").load =>
                response_text = $("body", $("iframe").contents()).text()
                try
                    response_json = JSON.parse(response_text)
                catch err
                    response_json = {}
                if response_json.image
                    self.loadDownloadFrame "Success!"
                    $("input[data=image_url]").val(response_json.image.url).change()
                    $("input[data=thumb_url]").val(response_json.thumb.url).change() if response_json.thumb
                else if response_json._error
                    self.loadDownloadFrame "Error!"
            @loadDownloadFrame()
            

        save: =>
            alert "saving gallery item"
            super

        loadDownloadFrame: (message) =>
            $.get "/s3?" + Math.random(), (policy_params) =>
                url = "https://thiscourse.s3.amazonaws.com/uploader/imageupload.html?" + Math.random() + "#policy:" + policy_params.policy + ",signature:" + policy_params.signature
                if message then url += ",message:" + message
                @$("iframe.uploader").attr "src", url

    class GalleryItemDisplayView extends itemviews.ItemDisplayView

        EditView: GalleryItemEditView

        render: =>
            super
            @$el.html templates.item_gallery @context()
            @bind_data()
            @$(".imagelink").fancybox
                cyclic: true
                hideOnContentClick: true
                overlayOpacity: 0.2
                showCloseButton: false
                title: templates.item_gallery_title @context
                titlePosition: "over"
                onComplete: =>
                    $("#fancybox-wrap").mousemove =>
                        $("#fancybox-title").fadeIn 200
                    $("#fancybox-wrap").mouseleave =>
                        $("#fancybox-title").stop().fadeOut 200
                    $("#fancybox-title").hide()

        initialize: =>
            @model.attributes.width = 4
            super

    class GalleryItemView extends itemviews.ItemView    
        EditView: GalleryItemEditView
        DisplayView: GalleryItemDisplayView

    
    title: "Gallery"
    description: "A gallery of photos, with expandable thumbnails"
    ItemView: GalleryItemView
    
define ["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, templates, styles) ->

    get_config = =>

        config = {}
       
        config.toolbar = [
                name: "document"
                items: [ "Source", "-", "Save", "-", "Templates" ]
            ,
                name: "clipboard"
                items: [ "Cut", "Copy", "Paste", "PasteText", "PasteFromWord", "-", "Undo", "Redo" ]
            ,
                name: "basicstyles"
                items: [ "Bold", "Italic", "Underline", "Strike", "Subscript", "Superscript", "-", "RemoveFormat" ]
            ,
                name: "paragraph"
                items: [ "NumberedList", "BulletedList", "-", "Outdent", "Indent", "-", "JustifyLeft", "JustifyCenter", "JustifyRight", "JustifyBlock" ]
            ,
                name: "links"
                items: [ "Link", "Unlink" ]
            ,
                name: "insert"
                items: [ "Image", "Table", "HorizontalRule", "SpecialChar" ]
            ,
                name: "styles"
                items: [ "Styles", "Format", "Font", "FontSize" ]
            ,
                name: "colors"
                items: [ "TextColor", "BGColor" ]
            ,
                name: "tools"
                items: [ "Maximize", "ShowBlocks" ]
        ]
        
        config.extraPlugins = "autogrow"
        config.autoGrow_bottomSpace = 30
        config.autoGrow_maxHeight = 1000
        config.autoGrow_minHeight = 300
        config.autoGrow_onStartup = true
        
        # TODO: use the following, with a built-in view, instead of the coffeetest one
        #config.filebrowserBrowseUrl = "/" + require("app").get("root_url") + 'filebrowse/all/'
        #config.filebrowserImageBrowseUrl = "/" + require("app").get("root_url") + 'filebrowse/picture/'
    
        config.filebrowserBrowseUrl = '/static/coffeetest/filebrowse.html?typefilter=all&courseid=' + course_id
        config.filebrowserImageBrowseUrl = '/static/coffeetest/filebrowse.html?typefilter=picture&courseid=' + course_id        
        
        return config

    class CKEditorView extends baseviews.BaseView

        initialize: =>
            @$el.html templates.ckeditor {html: @options.html}
            _.defer => @$(".ckeditor").ckeditor config

        html: => @$(".ckeditor").val()

    CKEditorView: CKEditorView
    get_config: get_config

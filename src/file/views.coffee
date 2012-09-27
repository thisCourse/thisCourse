define ["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, templates, styles) ->

    class FileBrowserView extends baseviews.BaseView
        
        el: "#content"
        
        initialize: ->
            @render()
        
        render: =>
            @$el.html templates.filebrowser @context()


    FileBrowserView: FileBrowserView
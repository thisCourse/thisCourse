define ["less!./styles", "cs!base/views", "cs!dialogs/views", "cs!./models", "hb!./templates.handlebars"], \
        (styles, baseviews, dialogviews, models, templates) ->

    class Window.GlossarySelectorView extends BaseView

        className: "glossaryselector"
            
        events:
            "click .content-button.add-button": "addNewItem"
            "click .content-button.ok-button": "glossSelect"
        
        
        render: =>
            @$el.html templates.content @context()
        
        initialize: =>
            @collection = require("app").course.get("glossary")
            @render()
            
            
        addNewItem: =>
            @collection.create
                title: ''
                html: ''
            
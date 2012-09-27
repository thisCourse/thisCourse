define ["cs!base/views", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, templates, styles) ->

    class ChatView extends baseviews.BaseView
        
        initialize: ->
            require("app").get("user").bind "change:email", =>
                @updateName()
                @render()
            @updateName()
        
        updateName: =>
            @name = require("app").get("user").get("email")?.split("@")[0] or ""
        
        render: =>
            @$el.html templates.chat @context(name: @name)


    ChatView: ChatView
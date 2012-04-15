define ["cs!base/views", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, templates, styles) ->

    class ChatView extends baseviews.BaseView
        
        initialize: ->
            require("app").get("user").bind "change:email", (model, email="") =>
                @name = email.split("@")[0]
                @render()
        
        render: =>
            @$el.html templates.chat @context(name: @name)


    ChatView: ChatView
define ["cs!base/views", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, templates, styles) ->

    class ChatView extends baseviews.BaseView
        
        render: =>
            @$el.html templates.chat @context()


    ChatView: ChatView
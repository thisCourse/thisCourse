define ["less!./styles", "cs!base/views"], (styles, baseviews) ->

    class ContentView extends baseviews.BaseView

        render: =>
            @$el.text "Loading subpage..."
            setTimeout @actually_render, 500

        actually_render: =>
            @$el.text "This is subpage #" + @options.id

    return ContentView: ContentView
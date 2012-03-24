define [], () ->

    class ContentView extends BaseView

        render: =>
            @$el.text "Loading subpage..."
            setTimeout @actually_render, 500

        actually_render: =>
            @$el.text "This is subpage #" + @options.id

    return
    	ContentView: ContentView
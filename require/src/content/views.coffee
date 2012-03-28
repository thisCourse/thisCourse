define ["less!./styles", "cs!base/views", "cs!./models"], (styles, baseviews, models) ->

    class ContentView extends baseviews.BaseView

        render: =>
            @$el.text "Loading subpage..."
            setTimeout @actually_render, 500

        actually_render: =>
            @$el.text "This is subpage #" + @model.id + ": " + @model.get("title") + " (" + @model.get("html") + ")"

    return ContentView: ContentView
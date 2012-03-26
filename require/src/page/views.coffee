define ["cs!base/views", "cs!./models", "cs!content/views"], (baseviews, models, contentviews) ->

    class PageRouterView extends baseviews.RouterView

        routes: =>
            "page/:id/": (content_id) => new contentviews.ContentView model: @collection.get(content_id)

    return PageRouterView: PageRouterView
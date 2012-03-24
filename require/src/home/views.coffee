define ["cs!base/views", "cs!./models"], (baseviews, models) ->

    class HomeView extends baseviews.BaseView

        render: =>
            @$el.html "<a href='lecture'>Lecture list</a>"

    return HomeView: HomeView
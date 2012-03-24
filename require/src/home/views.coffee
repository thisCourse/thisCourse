define ["cs!base/views", "cs!./models"], (baseviews, models) ->

    class HomeView extends BaseView

        render: =>
            @$el.html "<a href='/coffeetest/lecture/'>Lecture list</a>"

define ["cs!base/views", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, templates, styles) ->

    class SpinnerView extends baseviews.BaseView

        render: =>
            @$el.html templates.spinner()

    SpinnerView: SpinnerView

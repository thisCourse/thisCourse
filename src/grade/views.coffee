define ["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, templates, styles) ->

    class GradesView extends baseviews.BaseView

        initialize: ->
            @collection = new models.GradeCollection
            @collection.fetch().success @render

        render: =>
            @$el.html templates.grades @context()
            
            
    GradesView: GradesView


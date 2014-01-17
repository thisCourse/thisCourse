define ["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, templates, styles) ->

    class GradesView extends baseviews.BaseView

        initialize: ->
            @collection = new models.GradeCollection
            @collection.bind "change", @render
            @collection.fetch().success @setReview

        render: =>
            @$el.html templates.grades @context()
            
        setReview: =>
            if @collection.models
                for model in @collection.models
                    reviewlist = app.get("course").get("nuggets").filterWithIds(model.get("review"))
                    if reviewlist.models.length then model.set "review", reviewlist
                console.log @collection
                @render
            
            
    GradesView: GradesView


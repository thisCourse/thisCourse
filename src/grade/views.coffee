define ["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, templates, styles) ->

    class GradesView extends baseviews.BaseView

        initialize: ->
            @collection = new models.GradeCollection
            @collection.bind "change", @render
            @collection.fetch success: @render

        render: =>
            rerender = false
            for model in @collection.models
                if Array.isArray model.get("review")
                    rerender = rerender or @setReview(model)
            if rerender then _.defer @render
            @$el.html templates.grades @context()
            
        setReview: (model) =>
            if model
                reviewlist = app.get("course").get("nuggets").filterWithIds(model.get("review"))
                if reviewlist.models.length then model.set "review", reviewlist
            return true
            
            
    GradesView: GradesView


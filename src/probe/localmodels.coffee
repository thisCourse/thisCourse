define ["cs!base/models", "cs!./models"], (basemodels, models) ->

    class QuizModel extends basemodels.LazyModel

        relations: ->
            probes:
                collection: models.ProbeCollection
                includeInJSON: false

    class QuizCollection extends Backbone.Collection

        model: QuizModel

        localStorage: new Backbone.LocalStorage "review-quiz"

    QuizModel: QuizModel
    QuizCollection: QuizCollection
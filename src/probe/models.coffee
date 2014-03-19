define ["cs!base/models"], (basemodels) ->

    class AnswerModel extends basemodels.LazyModel
        
    
    class AnswerCollection extends basemodels.LazyCollection
        
        model: AnswerModel  
        
    class ProbeModel extends basemodels.LazyModel
        
        url: =>
            if app.get("user")?.get("email") is "admin"
                super
            else
                "/api/probe/" + (@id or "")
        
        apiCollection: "probe"
        
        relations: ->
            answers:
                collection: AnswerCollection
                includeInJSON: true
                

    class ProbeCollection extends basemodels.LazyCollection

        model: ProbeModel

    class QuizModel extends basemodels.LazyModel

        relations: ->
            probes:
                collection: ProbeCollection
                includeInJSON: false


    class QuizCollection extends Backbone.Collection

        model: QuizModel

        localStorage: new Backbone.LocalStorage "review-quiz"
        
    
    AnswerModel: AnswerModel
    AnswerCollection: AnswerCollection
    ProbeModel: ProbeModel
    ProbeCollection: ProbeCollection
    QuizModel: QuizModel
    QuizCollection: QuizCollection
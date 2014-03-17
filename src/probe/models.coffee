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

    class QuizCollection extends Backbone.Collection

        model: ProbeModel

        local: true
        
    
    AnswerModel: AnswerModel
    AnswerCollection: AnswerCollection
    ProbeModel: ProbeModel
    ProbeCollection: ProbeCollection
    QuizCollection: QuizCollection
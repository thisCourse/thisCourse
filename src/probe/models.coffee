define ["cs!base/models"], (basemodels) ->

    class AnswerModel extends basemodels.LazyModel
        
    
    class AnswerCollection extends basemodels.LazyCollection
        
        model: AnswerModel  
        
    class ProbeModel extends basemodels.LazyModel
        
        url: => "/api/probe/" + (@id or "")
        
        apiCollection: "probe"
        
        relations: ->
            answers:
                collection: AnswerCollection
                includeInJSON: true
                

    class ProbeCollection extends basemodels.LazyCollection

        model: ProbeModel


        
    
    AnswerModel: AnswerModel
    AnswerCollection: AnswerCollection
    ProbeModel: ProbeModel
    ProbeCollection: ProbeCollection
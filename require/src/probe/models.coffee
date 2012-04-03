define ["cs!base/models", "cs!page/models", "cs!probe/models"], (basemodels, pagemodels, probemodels) ->

    class AnswerModel extends basemodels.LazyModel
        
    
    
    class ProbeModel extends basemodels.LazyModel

        relations: ->
            answers:
                model: answermodels.AnswerModel
                includeInJSON: true
            probes:
                collection: probemodels.ProbeCollection
                includeInJSON: ['_id']

    class ProbeCollection extends basemodels.LazyCollection

        model: ProbeModel

    class AnswerCollection extends basemodels.LazyCollection
        
        model: AnswerModel
        
    
    AnswerModel: AnswerModel
    AnswerCollection: AnswerCollection
    ProbeModel: ProbeModel
    ProbeCollection: ProbeCollection
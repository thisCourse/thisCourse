define ["cs!base/models"], (basemodels) ->

    class ResponseModel extends basemodels.LazyModel
        
    
    class ResponseCollection extends basemodels.LazyCollection
        
        model: ResponseModel 
    
    
    class TrainingModel extends basemodels.LazyModel

        url: =>
            if app.get("user")?.get("email") is "admin"
                super
            else
                "/api/training/" + (@id or "")

        apiCollection: "training"
        
        relations: ->
            distractors:
                collection: ResponseCollection
                includeInJSON: true
            examples:
                collection: ResponseCollection
                includeInJSON: true
            tests:
                collection: ResponseCollection
                includeInJSON: true

    class TrainingCollection extends basemodels.LazyCollection

        model: TrainingModel

        filterWithIds: (ids) ->
            
            filteredlist = @filter (training) =>
                _.indexOf(ids, training.id) > -1
            filteredcollection = new Backbone.Collection filteredlist


    ResponseModel: ResponseModel
    ResponseCollection: ResponseCollection
    TrainingModel: TrainingModel
    TrainingCollection: TrainingCollection
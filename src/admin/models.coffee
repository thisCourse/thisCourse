define ["cs!base/models", "cs!probe/models"], (basemodels, probemodels) ->

    class TestModel extends basemodels.LazyModel

        relations: ->
            probeset:
                collection: probemodels.ProbeCollection
                includeInJSON: false
            
    # class AdminCollection extends basemodels.LazyCollection

        # model: AdminModel


    # AdminModel: AdminModel
    # AdminCollection: AdminCollection
    TestModel:TestModel
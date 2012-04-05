define ["cs!base/models", "cs!page/models", "cs!probe/models"], (basemodels, pagemodels, probemodels) ->

    class NuggetModel extends basemodels.LazyModel

        relations: ->
            page:
                model: pagemodels.PageModel
                includeInJSON: false
            probeset:
                collection: probemodels.ProbeCollection
                includeInJSON: false

    class NuggetCollection extends basemodels.LazyCollection

        model: NuggetModel


    NuggetModel: NuggetModel
    NuggetCollection: NuggetCollection

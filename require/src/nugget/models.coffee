define ["cs!base/models", "cs!page/models"], (basemodels, pagemodels) ->

    class NuggetModel extends basemodels.LazyModel

        relations: ->
            page:
                model: pagemodels.PageModel
                includeInJSON: false

    class NuggetCollection extends basemodels.LazyCollection

        model: NuggetModel

    NuggetModel: NuggetModel
    NuggetCollection: NuggetCollection
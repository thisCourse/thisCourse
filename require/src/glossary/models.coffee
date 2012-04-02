define ["cs!base/models"], (basemodels) ->

    class GlossaryModel extends basemodels.LazyModel

    class GlossaryCollection extends basemodels.LazyCollection

        model: GlossaryModel


    GlossaryModel: GlossaryModel
    GlossaryCollection: GlossaryCollection
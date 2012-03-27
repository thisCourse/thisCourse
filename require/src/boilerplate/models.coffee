define ["cs!base/models"], (basemodels) ->

    class BoilerModel extends basemodels.LazyModel

        apiCollection: "boiler"

    class BoilerCollection extends basemodels.LazyCollection

        model: BoilerModel


    BoilerModel: BoilerModel
    BoilerCollection: BoilerCollection
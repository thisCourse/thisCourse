define ["cs!base/models"], (basemodels) ->

    class ProbeModel extends basemodels.LazyModel

        apiCollection: "probe"

    class ProbeCollection extends basemodels.LazyCollection

        model: ProbeModel


    ProbeModel: ProbeModel
    ProbeCollection: ProbeCollection
define ["cs!base/models"], (basemodels) ->

    class AdminModel extends basemodels.LazyModel

        apiCollection: "admin"

    class AdminCollection extends basemodels.LazyCollection

        model: AdminModel


    AdminModel: AdminModel
    AdminCollection: AdminCollection
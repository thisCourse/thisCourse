define ["cs!base/models"], (basemodels) ->

    class UserStatusModel extends basemodels.LazyModel

        apiCollection: "user"

    class UserStatusCollection extends basemodels.LazyCollection

        model: UserStatusModel


    UserStatusModel: UserStatusModel
    UserStatusCollection: UserStatusCollection
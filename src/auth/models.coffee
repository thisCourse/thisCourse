define ["cs!base/models"], (basemodels) ->

    class UserModel extends basemodels.LazyModel
        apiCollection: "user"
                                        

    class UserCollection extends basemodels.LazyCollection
        model: UserModel
        


    UserModel: UserModel
    UserCollection: UserCollection
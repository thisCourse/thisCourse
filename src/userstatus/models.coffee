define ["cs!base/models"], (basemodels) ->

    class UserStatusModel extends basemodels.LazyModel

        apiCollection: "userstatus"
    
        relations: ->
            claimed:
                collection: Backbone.Collection
                includeinJSON: true
            partial:
                collection: Backbone.Collection
                includeinJSON: true
            unclaimed:
                collection: Backbone.Collection
                includeinJSON: true

    class UserStatusCollection extends basemodels.LazyCollection

        model: UserStatusModel


    UserStatusModel: UserStatusModel
    UserStatusCollection: UserStatusCollection
define ["cs!base/models"], (basemodels) ->

    class UserStatusModel extends basemodels.LazyModel

        url: =>
            "/api/userstatus/" + (@id or "")
        
        apiCollection: "userstatus"
    
        relations: ->
            claimed:
                collection: basemodels.LazyCollection
                includeinJSON: true
            partial:
                collection: basemodels.LazyCollection
                includeinJSON: true
            unclaimed:
                collection: basemodels.LazyCollection
                includeinJSON: true

    class UserStatusCollection extends basemodels.LazyCollection

        url: =>
            "/api/userstatus/"

        model: UserStatusModel


    UserStatusModel: UserStatusModel
    UserStatusCollection: UserStatusCollection
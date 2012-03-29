define ["cs!base/models", "cs!content/models", "cs!page/models"], (basemodels, contentmodels, pagemodels) ->

    class LectureModel extends basemodels.LazyModel

        apiCollection: "lecture"

        defaults:
            scheduled: []

        relations: ->
            page:
                model: pagemodels.PageModel
                includeInJSON: true

        # scheduleChanged: =>
        #     scheduled = @get("scheduled")
        #     if scheduled
        #         scheduled = [ scheduled ]    unless scheduled instanceof Array
        #         scheduled = _.map(scheduled, (date) ->
        #             new Date(date)
        #         )
        #     @set scheduled: scheduled

        # initialize: ->
        #     @bind "change:scheduled", @scheduleChanged, this
        #     @scheduleChanged()


    class LectureCollection extends basemodels.LazyCollection

        model: LectureModel

        comparator: (model) ->
            #alert(model.get("order"))
            return model.get("order")


    LectureModel: LectureModel
    LectureCollection: LectureCollection
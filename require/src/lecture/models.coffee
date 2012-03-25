define ["cs!base/models", "cs!content/models", "cs!page/models"], (basemodels, contentmodels, pagemodels) ->

    class LectureModel extends basemodels.LazyModel

        apiCollection: "lecture"

        relations: ->
            content:
                model: contentmodels.ContentModel
                includeInJSON: ['html']
            pages:
                collection: pagemodels.PageCollection
                includeInJSON: ['title']

    class LectureCollection extends basemodels.LazyCollection

        model: LectureModel

        comparator: (model) ->
            #alert(model.get("order"))
            return model.get("order")


    LectureModel: LectureModel
    LectureCollection: LectureCollection
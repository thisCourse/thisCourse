define ["cs!base/models", "cs!lecture/models", "cs!content/models"], \
        (basemodels, lecturemodels, contentmodels) ->

    class CourseModel extends basemodels.LazyModel

        urlRoot: "/api/course/"

        relations: ->
            lectures:
                collection: lecturemodels.LectureCollection
                includeInJSON: ["title", "description", "scheduled", "page"]
            content:
                model: contentmodels.ContentModel
                includeInJSON: ['html']


    CourseModel: CourseModel
define ["cs!base/models", "cs!lecture/models", "cs!content/models", "cs!page/models"], \
        (basemodels, lecturemodels, contentmodels, pagemodels) ->

    class CourseModel extends basemodels.LazyModel

        apiCollection: "course"

        relations: ->
            # lectures:
            #     collection: lecturemodels.LectureCollection
            #     includeInJSON: ["title", "description", "scheduled", "page", "html"]
            # content:
            #     model: contentmodels.ContentModel
            #     includeInJSON: true
            page:
                model: pagemodels.PageModel
                includeInJSON: ['title']

    class CourseCollection extends basemodels.LazyCollection

    CourseModel: CourseModel
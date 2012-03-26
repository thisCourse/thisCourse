define ["cs!base/models"], (basemodels) ->

    class GroupModel extends basemodels.LazyModel

    class CourseCollection extends basemodels.LazyCollection
        model: GroupModel

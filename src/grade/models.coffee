define ["cs!base/models"], (basemodels) ->

    class GradeModel extends basemodels.LazyModel
        apiCollection: "grade"

    class GradeCollection extends basemodels.LazyCollection

        model: GradeModel


    GradeModel: GradeModel
    GradeCollection: GradeCollection
define ["cs!base/models", "cs!content/models", "cs!page/models"], (basemodels, contentmodels, pagemodels) ->

    class AssignmentModel extends basemodels.LazyModel

        apiCollection: "assignment"

        relations: ->

    class AssignmentCollection extends basemodels.LazyCollection

        model: AssignmentModel

    AssignmentModel: AssignmentModel
    AssignmentCollection: AssignmentCollection
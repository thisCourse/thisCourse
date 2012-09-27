define ["cs!base/models", "cs!page/models"], (basemodels, pagemodels) ->

    class AssignmentModel extends basemodels.LazyModel

        apiCollection: "assignment"

        relations: ->
            page:
                model: pagemodels.PageModel
                includeInJSON: true # TODO: will this break 187a? used to be just "_id"
        

    class AssignmentCollection extends basemodels.LazyCollection

        model: AssignmentModel

    AssignmentModel: AssignmentModel
    AssignmentCollection: AssignmentCollection
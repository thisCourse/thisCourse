define ["cs!base/models"], (basemodels) ->

    class GlossaryModel extends basemodels.LazyModel
        defaults:
            name: "glossaryitem"
            html: "<p>Hi there!</p>"

    class GlossaryCollection extends basemodels.LazyCollection

        model: GlossaryModel


    GlossaryModel: GlossaryModel
    GlossaryCollection: GlossaryCollection
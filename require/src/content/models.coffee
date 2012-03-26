define ["cs!base/models"], (basemodels) ->

    class ContentModel extends basemodels.LazyModel
        apiCollection: "content"

    class ContentCollection extends basemodels.LazyCollection
        model: ContentModel

    ContentModel: ContentModel
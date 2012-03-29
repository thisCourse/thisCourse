define ["cs!base/models"], (basemodels) ->

    class ContentModel extends basemodels.LazyModel
        
        apiCollection: "content"
        
        relations: ->
            sections:
                collection: SectionCollection
                includeInJSON: true
        
    class ContentCollection extends basemodels.LazyCollection
        
        model: ContentModel

    class SectionModel extends basemodels.LazyModel

        defaults:
            width: 16

        relations: ->
            items:
                collection: ItemCollection
                includeInJSON: true
        
    class SectionCollection extends basemodels.LazyCollection
        
        model: SectionModel

    ContentModel: ContentModel
    ContentCollection: ContentCollection
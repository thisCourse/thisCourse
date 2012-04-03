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
            width: 12

        initialize: ->
            @set width: 12 # TODO: temp hack to prevent items from overflowing

        relations: ->
            items:
                collection: ItemCollection
                includeInJSON: true
        
    class SectionCollection extends basemodels.LazyCollection
        
        model: SectionModel

    class ItemModel extends basemodels.LazyModel

    class ItemCollection extends basemodels.LazyCollection
        model: ItemModel


    ContentModel: ContentModel
    ContentCollection: ContentCollection
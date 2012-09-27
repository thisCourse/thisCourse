define ["cs!base/models"], (basemodels) ->

    class ContentModel extends basemodels.LazyModel
        
        apiCollection: "content"
        
        getWidth: => Math.min(@get("width") or 16, @parent?.model?.getWidth?() or 16)
        
        relations: ->
            sections:
                collection: SectionCollection
                includeInJSON: true
        
    class ContentCollection extends basemodels.LazyCollection
        
        model: ContentModel

    class SectionModel extends basemodels.LazyModel

        initialize: ->
            # @set width: @parent?.model?.get("width") or 12 # TODO: temp hack to prevent items from overflowing

        getWidth: => Math.min(@get("width") or 16, @parent?.model?.getWidth())

        relations: ->
            items:
                collection: ItemCollection
                includeInJSON: true
        
    class SectionCollection extends basemodels.LazyCollection
        
        model: SectionModel

    class ItemModel extends basemodels.LazyModel
        
        getWidth: => Math.min(@get("width") or 16, @parent?.model?.getWidth() or 16)

    class ItemCollection extends basemodels.LazyCollection
        model: ItemModel


    ContentModel: ContentModel
    ContentCollection: ContentCollection
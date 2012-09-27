define ["cs!base/models", "cs!content/models"], (basemodels, contentmodels) ->

    class PageModel extends basemodels.LazyModel

        defaults:
            width: 12

        apiCollection: "page"
        
        getWidth: => @get("width") or 12
        
        relations: ->
            contents:
                collection: contentmodels.ContentCollection
                includeInJSON: ["title"]

    class PageCollection extends basemodels.LazyCollection

        model: PageModel

        comparator: (page) -> page.id


    PageModel: PageModel
    PageCollection: PageCollection

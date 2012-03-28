define ["cs!base/models", "cs!content/models"], (basemodels, contentmodels) ->

    class PageModel extends basemodels.LazyModel

        apiCollection: "page"
        
        relations: ->
            contents:
                collection: contentmodels.ContentCollection
                includeInJson: ["title"]
            

    class PageCollection extends basemodels.LazyCollection

        model: PageModel

        comparator: (page) -> page.id


    PageModel: PageModel
    PageCollection: PageCollection

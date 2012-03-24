define ["cs!base/models"], (basemodels) ->

    class PageModel extends basemodels.LazyModel

        apiCollection: "page"

    class PageCollection extends basemodels.LazyCollection

        model: PageModel


    PageModel: PageModel
    PageCollection: PageCollection

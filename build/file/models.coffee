define ["cs!base/models"], (basemodels) ->

    class FileModel extends basemodels.LazyModel

        apiCollection: "file"

    class FileCollection extends basemodels.LazyCollection
        
        model: FileModel


    FileModel: FileModel
    FileCollection: FileCollection
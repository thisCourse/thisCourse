define ["cs!base/models"], (basemodels) ->

    class GlossaryModel extends basemodels.LazyModel
        
        searchTitle: =>
            re =  new RegExp(@title,"gi") 
            for nugget in @collection.parent.parent.get("nuggets").models
                for content in nugget.get("page").get("contents").models
                    for section in content.get("sections").models
                        for item in section.get("items").models
                            if item.get("html")
                                $object = $.parseHTML(item.get("html"))
                                for object in $object
                                    if object.innerText.lower == @title.lower
                                        object.innerText.wrap("<glossary id = #{@_id}></glossary>")                                
                                    
                        
                           
                
    class GlossaryCollection extends basemodels.LazyCollection

        model: GlossaryModel


    GlossaryModel: GlossaryModel
    GlossaryCollection: GlossaryCollection
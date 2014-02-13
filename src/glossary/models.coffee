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
                                    node = object.firstChild
                                    remove = []
                                    if node then @replaceText(node, search, replace, remove) while node = node.nextSibling()
                                    if remove.length then $(remove, object).remove()
                                    # if object.innerText.lower == @title.lower
                                    #     object.innerText.wrap("<glossary id = #{@_id}></glossary>")                                
        
        replaceText: (node, search, replace, remove) ->
            if node.nodeType === 3
                #The original node value.
                val = node.nodeValue
                    
                new_val = val.replace( search, replace );
                    
                # Only replace text if the new value is actually different!
                if new_val != val
                    if !text_only && /</.test( new_val )
                        # The new value contains HTML, set it in a slower but far more
                        # robust way.
                        $(node).before( new_val )
                    
                        #Don't remove the node yet, or the loop will lose its place.
                        remove.push( node );
                    else
                        #The new value contains no HTML, so it can be set in this
                        #very fast, simple way.
                        node.nodeValue = new_val;                     
                        
                           
                
    class GlossaryCollection extends basemodels.LazyCollection

        model: GlossaryModel


    GlossaryModel: GlossaryModel
    GlossaryCollection: GlossaryCollection
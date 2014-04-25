define ["cs!base/models"], (basemodels) ->

    class AlternateTitleModel extends basemodels.LazyModel
        
    class AlternateTitleCollection extends basemodels.LazyCollection
        model: AlternateTitleModel
        
    class GlossaryModel extends basemodels.LazyModel
        
        searchTitle: (el) =>
            search_array = (model.get("alternateTitle") for model in @get("alternateTitle").models)
            search_array.unshift @get("title")
            for term in search_array
                if term!=undefined
                    re =  new RegExp("([ \.,;:'\"\s\u00A0]+)(#{term.trim()})([ \.,;:'\"\s\u00A0]+)","gi")
                    replace = "$1<glossary "
                    if @get("anatomy") then replace+="class='anatomy' "
                    replace += "id = #{@get("_id")}>$2</glossary>$3"
                    if el
                        remove = []
                        for object in el
                            @replaceText(object, re, replace, remove)
                        if remove.length
                            $(remove, el).remove()
        
        replaceText: (node, search, replace, remove) =>
            if node.childNodes
                for child in node.childNodes
                    if child.tagName == "GLOSSARY" then continue
                    if child.nodeType == 3
                        #The original node value.
                        val = child.nodeValue
                        new_val = val.replace( search, replace );
                        # Only replace text if the new value is actually different!
                        if new_val != val
                            if /</.test( new_val )
                                # The new value contains HTML, set it in a slower but far more
                                # robust way.
                                $(child).before new_val 
                                #Don't remove the node yet, or the loop will lose its place.
                                remove.push child
                                break
                            else
                                #The new value contains no HTML, so it can be set in this
                                #very fast, simple way.
                                child.nodeValue = new_val;
                    else if child.nodeType in [1,2,3,5,6,11] 
                        @replaceText(child, search, replace, remove)        
                        
        relations: ->
            alternateTitle:
                collection: AlternateTitleCollection
                includeInJSON: true
                           
                
    class GlossaryCollection extends basemodels.LazyCollection

        model: GlossaryModel


    GlossaryModel: GlossaryModel
    GlossaryCollection: GlossaryCollection
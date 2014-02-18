define ["cs!base/models"], (basemodels) ->

    class GlossaryModel extends basemodels.LazyModel
        
        searchTitle: =>
            re =  new RegExp("(#{@get("title")})","gi")
            replace = "<glossary id = #{@get("_id")}>$1</glossary>"
            console.log "This is re" + re
            console.log "This is replace" + replace
            # console.log "starting"
            # console.log @collection.parent.model.parent.model
            # if @collection.parent.model.get("nuggets").models
                # console.log "HI1"
            @collection.parent.model.get("nuggets").fetch().success =>
                @collection.parent.model.get("nuggets").forEach (nugget) =>
                    # if content in nugget.get("page").get("contents").models
                        # console.log "HI2"
                    nugget.get("page").get("contents").fetch().success =>
                        nugget.get("page").get("contents").forEach (content) =>
                        # if section in content.get("sections").models
                            # console.log "HI3"
                            content.get("sections").fetch().success =>
                                # console.log "Success!"
                                content.get("sections").forEach (section) =>
                                    section.get("items").fetch().success =>
                                        section.get("items").forEach (item) =>
                                            if item.get("html")
                                                # console.log item.get("html")
                                                $object = $.parseHTML(item.get("html"))
                                                removed = false
                                                for object in $object
                                                    remove = []
                                                    if object then @replaceText(object, re, replace, remove)
                                                    if remove.length
                                                        $(remove, object).remove()
                                                        removed = true
                                                if removed
                                                    test = (object.outerHTML for object in $object when object.outerHTML)
                                                    console.log test
                                                    teststr = test.join("")
                                                    # console.log "Setting this!" + test.join(teststr)
                                                    console.log teststr
                                                    # item.set "html": [object.outerHTML for object in $object].join("")
                                                    # item.save().success =>
                                                    #     console.log "Item changed!"
                                                    # console.log nugget.get("title")
                                                    # if object.innerText.lower == @title.lower
                                                    #     object.innerText.wrap("<glossary id = #{@_id}></glossary>")                                
        
        replaceText: (node, search, replace, remove) ->
            if node.childNodes
                for child in node.childNodes
                    if child.tagName == "GLOSSARY" then continue
                    if child.nodeType == 3
                        #The original node value.
                        val = child.nodeValue
                        # console.log val
                        new_val = val.replace( search, replace );
                        # Only replace text if the new value is actually different!
                        if new_val != val
                            console.log ("new val is not the same as old val")
                            if /</.test( new_val )
                                # The new value contains HTML, set it in a slower but far more
                                # robust way.
                                $(child).before( new_val )
                                #Don't remove the node yet, or the loop will lose its place.
                                remove.push( child );
                            else
                                #The new value contains no HTML, so it can be set in this
                                #very fast, simple way.
                                child.nodeValue = new_val;
                    else if child.nodeType in [1,2,3,5,6,11] 
                        @replaceText(child, search, replace, remove)        
                        
                           
                
    class GlossaryCollection extends basemodels.LazyCollection

        model: GlossaryModel


    GlossaryModel: GlossaryModel
    GlossaryCollection: GlossaryCollection
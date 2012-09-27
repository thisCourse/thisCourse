define [], () ->
    
    http_only = (val) -> val[0..6] == "http://"
    initial_underscore = (val) -> val[0] == "_"
    
    strict_options =
        tags:
            a:
                href: http_only
                target: initial_underscore
            b: {}
            h1: {}
            h2: {}
            h3: {}
            span: {}
            p: {}
        styles:
            background: true
            color: true
        classes:
            test: true
            bigger: true
    
    evaluate = (func_or_val, arg) ->
        if _.isFunction(func_or_val) then return func_or_val(arg) 
        return func_or_val
    
    sanitize_classname = (classname) ->
        classname = classname.trim()
        if not /^[_a-z]+[_a-z0-9-]*$/i.test(classname) then return ""
        return classname
    
    sanitize_attribute_value = (attrval) ->
        return CKEDITOR.tools.htmlEncode(attrval)
    
    sanitize = (html, options=strict_options) ->

        results = ""
        parser = new CKEDITOR.htmlParser
        
        parser.onTagOpen = (tag, attrs, unary) ->
            if tag not of options.tags then return
            results += "<" + tag
            
            allowed_attributes = _.extend {style: true, class: true}, options.tags[tag]
            
            for attr of attrs when attr of allowed_attributes
                
                if not evaluate(allowed_attributes[attr], attrs[attr]) then continue
                
                # include only whitelisted styles
                if attr is "style"
                    styles = []
                    for style in attrs[attr].split(";")
                        [stylename, styleval] = style.split(":")
                        if evaluate(options.styles[stylename.trim()], styleval) then styles.push style
                    if not styles.length then continue
                    attrs[attr] = styles.join(";")
                
                # include only whitelisted classes
                if attr is "class"
                    classes = []
                    for cls in attrs[attr].split(" ")                        
                        if evaluate(options.classes[cls], tag) then classes.push cls
                    if not classes.length then continue
                    attrs[attr] = classes.join(" ")
                
                # write out the attribute to the result
                results += " #{attr}=\"#{attrs[attr]}\""
            
            results += (if unary then "/" else "") + ">"

        parser.onTagClose = (tag) ->
            if tag not of options.tags then return
            results += "</" + tag + ">"

        parser.onText = (text) ->
            results += text

        parser.onCDATA = (cdata) ->
            alert "Parsed HTML contained CDATA: " + cdata

        parser.parse html
        
        return results
    
    
    sanitize: sanitize
    strict_options: strict_options
    sanitize_classname: sanitize_classname
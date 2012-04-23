define [], () ->
    
    http_only = (val) -> val[0..6] == "http://"
    initial_underscore = (val) -> val[0] == "_"
    
    strict_options =
        tags:
            a:
                href: http_only
                target: initial_underscore
            b: true
        styles:
            background: true
            color: true
        classes: ['test', 'bigger']
    
    evaluate = (func_or_val, arg) ->
        if _.isFunction(func_or_val) then return func_or_val(arg) 
        return func_or_val
    
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
                        if evaluate(options.styles[stylename.trim()], styleval)
                            styles.push style
                    if not styles.length then continue
                    attrs[attr] = styles.join(";")
                
                # include only whitelisted classes
                if attr is "class"
                    classes = (cls for cls in attrs[attr].split(" ") when cls in options.classes)
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
    
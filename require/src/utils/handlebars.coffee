define ["cs!./formatters", "cs!./sanitizers"], (formatters, sanitizers) ->
    
    # give access to all templates as partials
    Handlebars.partials = Handlebars.templates or= {}
    
    Handlebars.registerHelper "$date", (date) ->
        date = formatters.date_from_string(date)
        return $.datepicker.formatDate "D, M d, yy", date

    Handlebars.registerHelper "each_with_index", (array, fn) ->
        buffer = ""
        for item,i in array
            item.index = i
            buffer += fn(item)
        return buffer

    Handlebars.registerHelper "join_with_commas", (array, fn) ->
        return (fn(val) for val in array).join " / "

    Handlebars.registerHelper "sanitize", (html) ->
        html = sanitizers.sanitize(html)
        return new Handlebars.SafeString(html)
    
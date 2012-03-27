define ["cs!./formatters"], (formatters) ->
    
    # give access to all templates as partials
    Handlebars.partials = Handlebars.templates
    
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
    
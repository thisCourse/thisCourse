define [], () ->
    
    date_from_string = (date) ->
        if date instanceof Date then return date
        date = new Date(date)
        date.setHours 0
        date.setMinutes 0
        date.setSeconds 0
        date.setMilliseconds 0
        return date
    
    
    date_from_string: date_from_string
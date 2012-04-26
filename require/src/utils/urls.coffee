define [], () ->
    
    getUrlParams = (url) ->
        query = /(^[^?]*\?)?(.*)/g.exec(url)?[2] or ""
        params = {}
        for param in query.split("&")
            [key, val] = param.split("=")
            params[key] = val or ""
        return params
    
    
    getUrlParams: getUrlParams

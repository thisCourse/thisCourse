define [], () ->

    getUrlParam = (Url) ->
        reParam = new RegExp('[?&]([^?&]*)', 'gi')
        match = Url.split(reParam)
        if match and match.length > 1 then get for get in match when get else null
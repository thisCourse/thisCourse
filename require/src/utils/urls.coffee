getUrlParam = (paramName) ->
    reParam = new RegExp('(?:[\?&]|&amp;)' + paramName + '=([^&]+)', 'i')
    match = window.location.search.match(reParam)
    if match and match.length > 1 then match[1] else null
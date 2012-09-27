define [], () ->

    window._gaq = window._gaq || []
    _gaq.push(['_setAccount', 'UA-4950843-6'])
    
    ga_initialize = ->
        ga = document.createElement("script")
        ga.type = "text/javascript"
        ga.async = true
        ga.src = (if "https:" is document.location.protocol then "https://ssl" else "http://www") + ".google-analytics.com/ga.js"
        s = document.getElementsByTagName("script")[0]
        s.parentNode.insertBefore ga, s

    ga_track_pageview = (url) ->
        if environ=="DEPLOY"
            _gaq.push ["_trackPageview", url]

    ga_log_error = (message, category="Global") ->
        if environ=="DEPLOY"
            _gaq.push ['_trackEvent', 'Errors', category, message, null, true]
    
    if environ=="DEPLOY"
        window.onerror = (message, file, line) ->
            formattedMessage = '[' + file + ' (' + line + ')] ' + message.toString()
            ga_log_error formattedMessage
       
    
    ga_initialize: ga_initialize
    ga_track_pageview: ga_track_pageview
    ga_log_error: ga_log_error
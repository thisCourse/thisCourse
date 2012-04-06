define [], () ->

    window._gaq = window._gaq || [];
    _gaq.push(['_setAccount', 'UA-4950843-6']);
    
    ga_initialize: ->
        ga = document.createElement("script")
        ga.type = "text/javascript"
        ga.async = true
        ga.src = (if "https:" is document.location.protocol then "https://ssl" else "http://www") + ".google-analytics.com/ga.js"
        s = document.getElementsByTagName("script")[0]
        s.parentNode.insertBefore ga, s

    ga_track_pageview: (url) ->
        _gaq.push ["_trackPageview", url]

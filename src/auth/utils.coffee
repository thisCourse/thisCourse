define [], () ->
    
    get_cookie_token: ->
        cookies = document.cookie.split(";")
        i = 0

        while i < cookies.length
            cookie = cookies[i].split("=")
            return cookie[1]    if cookie[0] is "token"
            i++

    login: (user, email, password) ->
        xhdr = $.post "/login", email: email, password: password, (response) =>
            if response.email == email
                user.set response
                user.set loggedIn: true
        return xhdr

    logout: (user) ->
        xhdr = $.post "/logout", =>
            user.set loggedIn: false, email: undefined
        return xhdr
            
    
    check: (user) ->
        $.get "/check", (response) ->
            user.set response
            if response.email
                user.set loggedIn: true
            else
                user.set loggedIn: false


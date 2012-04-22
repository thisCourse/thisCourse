define ["cs!base/views", "cs!./models", "cs!./utils", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, utils, templates, styles) ->            

    class LoginView extends baseviews.BaseView
        
        events: => _.extend super,
            "click .login-button": "submitLogin"
            "keypress input": "submitOnEnter"
            "click .logout-button": "submitLogout"

        initialize: ->
            @model.bind "change:loggedIn", @loginStatusChanged
            @checkLoginStatus()
            setInterval @checkLoginStatus, 60000
        
        loginStatusChanged: =>
            @render()
            require("app").trigger "loginChanged"
        
        render: =>
            if @model.get("loggedIn")==true
                @$el.html templates.logout @context()
            else if @model.get("loggedIn")==false
                @$el.html templates.login @context()

        checkLoginStatus: =>
            utils.check(@model)

        submitLogin: =>
            login = utils.login(@model, @$(".email").val(), @$(".password").val())
            login.error => alert("There was an error logging you in. Please try again.")

        submitLogout: =>
            logout = utils.logout(@model)
            logout.error => alert("There was an error logging you out.")

        submitOnEnter: (ev) =>
            if ev.which is 13
                @submitLogin()
                return false

    LoginView: LoginView
define ["cs!base/views", "cs!course/views", "cs!auth/views", "hb!./templates.handlebars", "less!libs/bootstrap/bootstrap", "less!./styles", "cs!userstatus/views", "cs!userstatus/models"], \
        (baseviews, courseviews, authviews, templates, bootstrap, styles, userstatusviews, userstatusmodels) ->

    class AppView extends baseviews.BaseView

        initialize: ->
            $("body").append @$el
            @model.get("user").bind "change:loggedIn", @loginChanged
            @loginChanged()
            @listenForWindowBlur()

        loginChanged: =>
            is_logged_in = @model.get("user").get("loggedIn")
            @$el.toggleClass "logged-in", is_logged_in
            @$el.toggleClass "logged-out", not is_logged_in
            is_editor = is_logged_in and @model.get("user").get("email")=="admin"
            @$el.toggleClass "editable", is_editor
            @$el.toggleClass "uneditable", not is_editor
            if is_logged_in then @addUserStatus() else @clearUserStatus()
            @model.trigger "nuggetAnalyticsChanged"

        listenForWindowBlur: =>
            timer = 0
            $(window).blur =>
                clearTimeout(timer)
                timer = setTimeout (=> @model.trigger "windowBlur"), 1000
            $(window).focus =>
                clearTimeout(timer)

        render: =>
            @$el.html templates.root @context()
            @add_subview "courseview", new courseviews.CourseView(model: @model.get("course")), "#content"
            @add_subview "toptabsview", new TopTabsView(collection: @model.get("tabs")), "#toptabs"
            @add_subview "loginview", new authviews.LoginView(model: @model.get("user")), "#authbar"

        addUserStatus: =>
            if @model.get("user").get("status_id")
                @model.set "userstatus": new userstatusmodels.UserStatusModel(_id: @model.get("user").get("status_id"))
                @model.get("userstatus").fetch().success =>
                    @model.get("userstatus").bind "nuggetAnalytics", @model.trigger "nuggetAnalyticsChanged"
                    @model.trigger "nuggetAnalyticsChanged"
                    @add_subview "userstatusview", new userstatusviews.UserStatusView(model: @model.get("userstatus")), "#life_shield"
                    @setTabs()

        clearUserStatus: =>
            if "userstatusview" of @subviews
                @close_subview "userstatusview"
            if @model.get("userstatus")
                @model.unset "userstatus"
            @model.trigger "nuggetAnalyticsChanged"

        setTabs: =>
            if @model.get("userstatus") 
                if @model.get("userstatus").get("examMode") == 'Midterm'
                    @model.get("tabs").reset()
                    app.get("tabs").add title: "Midterm", slug: "midterm", priority: 0
                else if @model.get("userstatus").get("examMode") == 'Final'
                    @model.get("tabs").reset()
                    app.get("tabs").add title: "Final", slug: "final", priority: 0

    class TopTabsView extends baseviews.BaseView

        tagName: "ul"
        className: "pills"

        initialize: ->
            @collection.bind "all", @render
        
        render: =>
            @$el.html templates.top_tabs @context(root_url: @url)
        
        navigate: (fragment) =>
            @$("li.active").removeClass("active")
            slug = fragment.split("/")[0]
            @$("#toptab_" + slug).addClass("active")
            

    return AppView: AppView
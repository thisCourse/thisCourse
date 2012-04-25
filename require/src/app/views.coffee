define ["cs!base/views", "cs!course/views", "cs!auth/views", "hb!./templates.handlebars", "less!libs/bootstrap/bootstrap", "less!./styles"], \
        (baseviews, courseviews, authviews, templates, bootstrap, styles) ->

    class AppView extends baseviews.BaseView

        initialize: ->
            $("body").append @$el
            @model.get("user").bind "change:loggedIn", @loginChanged
            @loginChanged()

        loginChanged: =>
            is_logged_in = @model.get("user").get("loggedIn")
            @$el.toggleClass "logged-in", is_logged_in
            @$el.toggleClass "logged-out", not is_logged_in
            is_editor = is_logged_in and @model.get("user").get("email")=="admin"
            @$el.toggleClass "editable", is_editor
            @$el.toggleClass "uneditable", not is_editor

        render: =>
            @$el.html templates.root @context()
            @add_subview "courseview", new courseviews.CourseView(model: @model.get("course")), "#content"
            @add_subview "toptabsview", new TopTabsView(collection: @model.get("tabs")), "#toptabs"
            @add_subview "loginview", new authviews.LoginView(model: @model.get("user")), "#authbar"

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
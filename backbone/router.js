var App = Backbone.Model.extend({
    initialize: function() {
        var self = this 
    },
    defaults: {
        tabs: [
            {title: "Home", route: ""},
            {title: "Lectures", route: "lectures"},
            {title: "Assignments", route: "assignments"}
        ]
    }
})

var AppView = Backbone.View.extend({
    el: "#content",
    initialize: function() {
        this.el = $(this.el)
        this.model.bind("change:topview", this.viewChanged, this)
        this.model.bind("change:url", this.urlChanged, this)
    },
    viewChanged: function() {
        if (app.previous("topview") && app.previous("topview").close)
            app.previous("topview").close()
        this.el.html("").append(app.get("topview").render().el)
    },
    urlChanged: function(model, new_url) {
        // if the url starts with a slash, strip that off first
        if (new_url[0]=="/") return this.model.set({url: new_url.slice(1)})
        this.model.set({tab: new_url.split("/")[0]})
        Backbone.history.navigate(new_url, true)
    }
})

var MainRouter = Backbone.Router.extend({

    routes: {
        "":                                     "home",
        "lectures":                             "lecture",
        "lectures/:lecture":                    "lecture",
        "lectures/:lecture/page/:page":         "lecture",
        "assignments":                          "assignment",
        "assignments/:assignment":              "assignment",
        "assignments/:assignment/page/:page":   "assignment"
    },
    
    initialize: function() {

    },

    home: function() {
        app.set({topview: new HomeView({model: app.course})})
    },
    
    lecture: function(lecture, page) {
        //$("#content").text("lecture " + lecture + " (page " + page + ")")
        var topview
        if (lecture) {
            var model = app.course.get('lectures').get(lecture)
            topview = new LectureView({model: model})
            model.fetch().then(function() { model.fetchRelated() })
        } else {
            topview = new LectureListView({collection: app.course.get('lectures')}) 
        }
        app.set({topview: topview})
    },

    assignment: function(assignment, page) {
        var topview
        if (assignment) {
            var model = app.course.get('assignments').get(assignment)
            topview = new AssignmentView({model: model})
            model.fetch().then(function() { model.fetchRelated() })
        } else {
            topview = new AssignmentListView({collection: app.course.get('assignments')}) 
        }
        app.set({topview: topview})
    }
    
})

TabView = Backbone.View.extend({
    tagName: "li",
    render: function() {
        this.el.html("<a href='/" + this.options.route + "'>" + this.options.title + "</a>")
        return this
    },
    initialize: function() {
        this.el = $(this.el)
    },
    events: {
        "click a": "linkClicked"
    },
    linkClicked: function(ev) {
        ev.preventDefault()
        app.set({url: this.options.route})
        return false
    }
})

TabsView = Backbone.View.extend({
    el: "#toptabs",
    tagName: "ul",
    className: "pills",
    render: function() {
        var self = this
        this.el.html("")
        _.each(this.tabViews, function(tabView) {
            self.el.append(tabView.render().el)
        })
    },
    initialize: function() {
        this.tabViews = []
        this.el = $(this.el)
        app.bind("change:tab", this.tabChanged, this)
        app.bind("change:tabs", this.tabsChanged, this)
        app.bind("change", this.changed, this)
        this.tabsChanged()
        this.render()
    },
    tabsChanged: function() {
        var self = this
        this.tabViews = []
        _.each(app.get('tabs'), function(tab) {
            self.tabViews.push(new TabView(tab)) 
        })
    },
    tabChanged: function(model, tab) {
        _.each(this.tabViews, function(tabView) {
            tabView.el.toggleClass("active", tabView.options.route==tab)
        })
    },
    changed: function() {
        
    }
})

$(function() {

	if (!window.base_url)
    	base_url = window.location.pathname.split("/").slice(0,3).join("/") + "/"

	if (!window.course_id)
    	course_id = window.location.pathname.split("/")[2]

    window.app = new App

    app.course = new Course({_id: course_id}) //4ecdcece5ce3fac87f000001"})
    app.course.fetch().then(function() {
    
        app.tabView = new TabsView
        app.router = new MainRouter
        app.view = new AppView({model: app})
        
        Backbone.history.start({pushState: true, root: base_url}) 
                
        app.set({url: Backbone.history.fragment})
    
    })
	
	$.get("/check", function(response) {
		if (response)
			bind_logout_link()
		else
			bind_login_link()
	})
	
    
})

function bind_login_link() {
    $("#login").unbind().html("Login...").click(function() {
		dialog_request_response("Enter password:", function(password) {
			$.get("/login?password=" + password, function(response) {
				if (response.token) {
					app.token = response.token
					bind_logout_link()
				}
			})
		}, "Login")
		return false
    })	
}

function bind_logout_link() {
	$("#login").unbind().html("Logout...").click(function() {
		$.get("/logout", bind_login_link)
		return false
	})	
}

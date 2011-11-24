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
        //$("#content").text("home")
        
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
        //$("#content").text("assignment " + assignment + " (page " + page + ")")
        
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

    window.app = new App

    app.course = new Course({_id: "4ecc8e416e0604665d000016"}) //4ecdcece5ce3fac87f000001"})
    app.course.fetch().then(function() {
    
        app.tabView = new TabsView
        app.router = new MainRouter
        app.view = new AppView({model: app})
        
        Backbone.history.start({pushState: true, root: "/"}) 
                
        app.set({url: Backbone.history.fragment})
    
    })
})
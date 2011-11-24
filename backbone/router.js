State = Backbone.Model.extend({
    initialize: function() {
        var self = this 
        this.bind("change:tab", this.tabChanged, this)
    },
    defaults: {
        tab: "home",
        tabs: [
            {title: "Home", route: ""},
            {title: "Lectures", route: "lectures/"},
            {title: "Assignments", route: "assignments/"}
        ]
    },
    tabChanged: function() {
        router.navigate(this.get("tab"), true)
    }
})

state = new State()

var MainRouter = Backbone.Router.extend({

    routes: {
        "/":                        "home",
        "":                         "home",
        "lectures/:lecture":        "lecture",
        "assignments/:assignment":  "assignment"
    },
    
    initialize: function() {

    },

    home: function() {
        //alert("home!")
    },
    
    lecture: function(lecture) {
        //alert("lecture " + lecture)
    },

    assignment: function(assignment) {
        //alert("assignment " + assignment)
    }

})

var router = new MainRouter

Backbone.history.start({pushState: true, root: "/"})

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
        //alert('clicked')
        state.set({tab: this.options.route})
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
        state.bind("change:tab", this.tabChanged, this)
        state.bind("change:tabs", this.tabsChanged, this)
        state.bind("change", this.changed, this)
        this.tabsChanged()
        this.render()
    },
    tabsChanged: function() {
        var self = this
        this.tabViews = []
        _.each(state.get('tabs'), function(tab) {
            self.tabViews.push(new TabView(tab)) 
        })
    },
    tabChanged: function() {
        _.each(this.tabViews, function(tabView) {
            tabView.el.toggleClass("active", tabView.options.route==state.get("tab"))
        })        
    },
    changed: function() {
        
    }
})

$(function() {
// 
    // $("#nav_home").click(function() {
        // workspace.navigate("", true)
        // return false
    // })
//     
    // $("#nav_lectures").click(function() {
        // workspace.navigate("/lectures/", true)
        // return false
    // })
//     
    // $("#nav_assignments").click(function() {
        // workspace.navigate("/assignments/", true)
        // return false
    // })

    tabs = new TabsView()
    state.set({tab: ""})
    
})
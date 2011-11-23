var Workspace = Backbone.Router.extend({

    routes: {
        //"/":                        "home",
        //"":                         "test",
        "lecture/:lecture":         "lecture",
        "assignment/:assignment":   "assignment"
    },
    
    initialize: function() {
        //alert('binding')
        //this.bind("route:home", this.home, this)
        //this.bind("route:lecture", this.lecture, this)
        //this.bind("route:assignment", this.assignment, this)
    },

    test: function() {
        alert("empty")
    },
    
    home: function() {
        alert("home!")
    },
    
    lecture: function(lecture) {
        alert("lecture " + lecture)
    },

    assignment: function(assignment) {
        alert("assignment " + assignment)
    }

})

var workspace = new Workspace

Backbone.history.start({pushState: true, root: "/static/"})


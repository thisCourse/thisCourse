HomeView = Backbone.View.extend({
    tagName: "div",
    className: "home",
    template: "home", 
    render: function() {
    	this.renderTemplate()
    	this.scheduleView = new ScheduleView
    	this.el.append(this.scheduleView.el)
        return this
    },
    initialize: function() {
        this.el = $(this.el)
        this.render()
    }
})


HomeView = Backbone.View.extend({
    tagName: "div",
    className: "home",
    template: "home", 
    render: function() {
    	var self = this
    	this.renderTemplate()
    	this.scheduleView = new ScheduleView({el: this.$(".schedule")})
    	var content = app.course.get("content") 
    	if (content && content.id) {
    		content.fetch()
    		this.renderContent()
    	} else if (app.course.get("_editor")) {
    		app.course.set({"content": new Content({_editor: true, title: ""})})
    		app.course.get("content").save().success(function() {
    			app.course.save()
    			self.renderContent()
    		})
    	}
        return this
    },
    renderContent: function() {
    	this.contentView = new ContentView({model: app.course.get("content")})
    	this.$(".content").append(this.contentView.el)
    },
    initialize: function() {
        this.el = $(this.el)
        this.render()
    }
})


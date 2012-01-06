ScheduleView = Backbone.View.extend({
    tagName: "div",
    className: "section border2",
    template: "schedule-section",
    buttonFadeSpeed: 60,
    render: function() {
        this.renderTemplate()
        return this
    },
    events: {
        // "mouseenter .section-inner": "showBottomActionButtons",
        // "mouseleave .section-inner": "hideAllActionButtons",
        // "mouseenter .sectiontitle": "showTopActionButtons",
        // "mouseout .sectiontitle": "hideTopActionButtons",
        // "mouseenter .items": "hideTopActionButtons",
        // "click .section-button.add-button": "addNewItem",
        // "click .section-button.delete-button": "delete"
    },
    initialize: function() {
        this.dateViews = {}
        this.itemViews = []
        this.el = $(this.el)
        if (!this.model)
        	this.model = app.course // TODO: not hard code this to global namespace?
        this.model.bind("add:lectures", this.addLectures, this)
        this.model.bind("add:assignments", this.addAssignments, this)
        this.render()
        for (var i=0; i < this.model.get('assignments').length; i++)
            this.addAssignments(this.model.get('assignments').at(i))
        for (var i=0; i < this.model.get('lectures').length; i++)
            this.addLectures(this.model.get('lectures').at(i))
    },
    addAssignments: function(model, coll) {
        var itemView = new ScheduleItemView({model: model, type: "Assignment"})
        var dateView = this.getOrCreateDateView(model.getDate("due"))
        if (dateView)
        	dateView.$(".schedule-items").append(itemView.render().el)
    },
    addLectures: function(model, coll) {
        var itemView = new ScheduleItemView({model: model, type: "Lecture"})
        var dateView = this.getOrCreateDateView(model.getDate("scheduled"))
        if (dateView)
        	dateView.$(".schedule-items").append(itemView.render().el)
    },
    getOrCreateDateView: function(date) {
    	if (!date) return
    	if (!this.dateViews[date]) {
    		var insertAfter = null
    		for (var oldDate in this.dateViews) {
    			oldDate = new Date(oldDate)
    			if (oldDate < date && (!insertAfter || (insertAfter < oldDate)))
    				insertAfter = oldDate
    		}
    		this.dateViews[date] = new ScheduleDateView({date: date})
    		if (insertAfter)
    			this.dateViews[insertAfter].el.after(this.dateViews[date].render().el)
    		else
    			this.$(".schedule-inner").prepend(this.dateViews[date].render().el)
    	}
    	return this.dateViews[date]
    }
})

ScheduleDateView = Backbone.View.extend({
    tagName: "tr",
    className: "date",
    template: "schedule-date",
    render: function() {
        this.renderTemplate({data: {date: this.options.date.toDateString()}})
        return this
    },
    events: {
        // "mouseenter .section-inner": "showBottomActionButtons",
        // "mouseleave .section-inner": "hideAllActionButtons",
        // "mouseenter .sectiontitle": "showTopActionButtons",
        // "mouseout .sectiontitle": "hideTopActionButtons",
        // "mouseenter .items": "hideTopActionButtons",
        // "click .section-button.add-button": "addNewItem",
        // "click .section-button.delete-button": "delete"
    },
    initialize: function() {
        this.dateViews = {}
        this.el = $(this.el)
        this.render()
    }
})

ScheduleItemView = Backbone.View.extend({
    tagName: "div",
    className: "schedule_item",
    template: "schedule-item",
    render: function() {
        this.renderTemplate({data: {type: this.options.type, item: this.model.attributes}})
        return this
    },
    events: {
        // "mouseenter .section-inner": "showBottomActionButtons",
        // "mouseleave .section-inner": "hideAllActionButtons",
        // "mouseenter .sectiontitle": "showTopActionButtons",
        // "mouseout .sectiontitle": "hideTopActionButtons",
        // "mouseenter .items": "hideTopActionButtons",
        // "click .section-button.add-button": "addNewItem",
        // "click .section-button.delete-button": "delete"
    },
    initialize: function() {
        this.el = $(this.el)
        console.log(this.model)
        //this.model.bind("change", this.update, this)
        this.render()
    },
    update: function() {
    	
    }
})

setTimeout(function() {
	v = new ScheduleView
	$("#container").append(v.el)
}, 2000)

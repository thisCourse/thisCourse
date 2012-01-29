Lecture = Backbone.RelationalModel.extend({
    relations: [{
        type: Backbone.HasOne,
        key: 'page',
        relatedModel: 'Page',
        includeInJSON: "_id",
        // reverseRelation: { // TODO: this was commented out because it BREAKS EVERYTHING FOR NO REASON... grr
            // key: 'parent',
            // includeInJSON: false,
            // type: Backbone.HasOne
        // }
    }],
    urlRoot: '/api/lecture',
    defaults: {
        page: {},
        scheduled: []
    },
    scheduleChanged: function() {
        var scheduled = this.get("scheduled")
        console.log(scheduled) 
    	if (scheduled) {
	    	if (!(scheduled instanceof Array)) scheduled = [scheduled] // because the old schema just had a single date
	    	scheduled = _.map(scheduled, function(date) { return new Date(date) })
	    }
		this.set({scheduled: scheduled})
    },
    initialize: function() {
        var self = this
        this.bind("change:scheduled", this.scheduleChanged, this)
        this.scheduleChanged()
        //this.get("page").bind('save', this.save, this)
        //this.get("page").url = function() { return self.url() + "/page" }
        //this.get('sections').url = function() { return self.url() + "/sections" }
    }
})

LectureCollection = Backbone.Collection.extend({
    model: Lecture,
    initialize: function() {
        
    }    
})
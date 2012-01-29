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
    initialize: function() {
        var self = this
        //this.get("page").bind('save', this.save, this)
        //this.get("page").url = function() { return self.url() + "/page" }
        //this.get('sections').url = function() { return self.url() + "/sections" }
    },
    parse: function(data) {
    	if (data.scheduled) {
	    	if (!(data.scheduled instanceof Array)) data.scheduled = [data.scheduled] // because the old schema just had a single date
	    	data.scheduled = _.map(data.scheduled, function(date) { return new Date(date) })
	    }
    	return data
    }
})

LectureCollection = Backbone.Collection.extend({
    model: Lecture,
    initialize: function() {
        
    }    
})
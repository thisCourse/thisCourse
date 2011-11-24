Lecture = Backbone.RelationalModel.extend({
    relations: [{
        type: Backbone.HasOne,
        key: 'page',
        relatedModel: 'Page',
        includeInJSON: "_id",
        reverseRelation: {
            key: 'parent',
            includeInJSON: false,
            type: Backbone.HasOne
        }
    }],
    urlRoot: '/api/lecture',
    defaults: {
        page: {}
    },
    initialize: function() {
        var self = this
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
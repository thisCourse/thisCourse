Lecture = Backbone.RelationalModel.extend({
    relations: [{
        type: Backbone.HasOne,
        key: 'page',
        relatedModel: 'Page',
        includeInJSON: "_id",
        reverseRelation: {
            key: 'lecture',
            includeInJSON: "_id"
        }
    }],
    urlRoot: '/api/lecture',
    initialize: function() {
        var self = this 
        //this.get('sections').url = function() { return self.url() + "/sections" }
    }
})

LectureCollection = Backbone.Collection.extend({
    model: Lecture,
    initialize: function() {
           
    }    
})
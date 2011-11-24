Assignment = Backbone.RelationalModel.extend({
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
    urlRoot: '/api/assignment',
    initialize: function() {
        var self = this 
        //this.get('sections').url = function() { return self.url() + "/sections" }
    }
})

AssignmentCollection = Backbone.Collection.extend({
    model: Assignment,
    initialize: function() {
           
    }    
})
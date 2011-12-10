Assignment = Backbone.RelationalModel.extend({
    relations: [{
        type: Backbone.HasOne,
        key: 'page',
        relatedModel: 'Page',
        includeInJSON: "_id",
        // reverseRelation: {
            // key: 'parent',
            // includeInJSON: false,
            // type: Backbone.HasOne
        // }
    }],
    urlRoot: '/api/assignment',
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

AssignmentCollection = Backbone.Collection.extend({
    model: Assignment,
    initialize: function() {
        
    }    
})
Page = Backbone.RelationalModel.extend({
    relations: [{
        type: Backbone.HasMany,
        key: 'contents',
        relatedModel: 'Content',
        collectionType: 'ContentCollection',
        includeInJSON: ["_id", "title"],
        reverseRelation: {
            key: 'parent',
            includeInJSON: false
        },
    }],
    urlRoot: '/api/page',
    initialize: function() {
        var self = this 
        //this.get('sections').url = function() { return self.url() + "/sections" }
    }
})

Page = Backbone.RelationalModel.extend({
    relations: [{
        type: Backbone.HasMany,
        key: 'contents',
        relatedModel: 'Content',
        collectionType: 'ContentCollection',
        includeInJSON: ["_id", "title"],
        reverseRelation: {
            key: 'page',
            includeInJSON: "_id"
        }
    }],
    urlRoot: '/api/page',
    initialize: function() {
        var self = this 
        //this.get('sections').url = function() { return self.url() + "/sections" }
    }
})

PageCollection = Backbone.Collection.extend({
    model: Page,
    initialize: function() {
        //console.log("sectioncollection created", this)   
    }    
})
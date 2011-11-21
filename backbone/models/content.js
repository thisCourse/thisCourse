Content = Backbone.RelationalModel.extend({
    relations: [{
        type: Backbone.HasMany,
        key: 'sections',
        relatedModel: 'Section',
        collectionType: 'SectionCollection',
        includeInJSON: '_id',
        reverseRelation: {
            key: 'parent',
            includeInJSON: false
        }
    }],
    urlRoot: '/api/content',
    initialize: function() {
        var self = this 
        this.get('sections').url = function() { return self.url() + "/sections" }
    },
    parse: function(data) {
        $("#jsoncode").html(JSON.stringify(data))
        return data
    }
})

ContentCollection = Backbone.Collection.extend({
    model: Content,
    initialize: function() {
        //console.log("sectioncollection created", this)   
    }    
})
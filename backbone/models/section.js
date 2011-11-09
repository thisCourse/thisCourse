Section = Backbone.RelationalModel.extend({
    relations: [{
        type: Backbone.HasMany,
        key: 'items',
        relatedModel: 'Item',
        collectionType: 'ItemCollection',
        includeInJSON: "_id",
        reverseRelation: {
            key: 'parent',
            includeInJSON: false
        },
    }],
    defaults: {width: 16},
    initialize: function() {
        // this is a hack to force "items" to be a collection rather than an empty list 
        if (this.get('items').length==0)
            this.set({items: [,]})
        var self = this 
        this.get('items').url = function() { return self.url() + "/items" }
    }
})

SectionCollection = Backbone.Collection.extend({
    model: Section,
    initialize: function() {
        //console.log("sectioncollection created", this)   
    }    
})
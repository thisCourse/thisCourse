Item = Backbone.RelationalModel.extend({
    initialize: function() {
        //console.log("item created", this)   
    },
    defaults: {width: 4}
})

ItemCollection = Backbone.Collection.extend({
    model: Item,
    initialize: function() {
        //console.log("itemcollection created", this)   
    } 
})
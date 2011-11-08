
/* ----- Handlebars ----- */

// give access to all templates as partials
Handlebars.partials = Handlebars.templates


/* ----- Backbone ----- */

// change the id attribute to use Mongo's _id
Backbone.Model.prototype.idAttribute = "_id";

// reorder the models in a collection by a list of ids (e.g. from jquery ui sortable)
Backbone.Collection.prototype.reorder = function(order) {
    var new_models = []
    for (var i=0; i < order.length; i++) {
        new_models[i] = this.get(order[i])
    }
    this.models = new_models
    return this
}


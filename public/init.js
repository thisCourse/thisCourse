
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

// render a view's template using its model data, then write it to the element
Backbone.View.prototype.renderTemplate = function() {
    var html = ""
    if (this.template) {
        if (this.model) {
            html = Handlebars.templates[this.template](this.model.attributes)
        } else {
            console.log("View does not have a model associated with it.")
        }
    } else {
        console.log("View does not have a template associated with it.")
    }
    $(this.el).html(html)
}

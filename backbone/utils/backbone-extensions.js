
/* ----- Handlebars ----- */

// give access to all templates as partials
Handlebars.partials = Handlebars.templates


/* ----- Backbone ----- */

var Dispatcher = {}
_.extend(Dispatcher, Backbone.Events)

// change the id attribute to use Mongo's _id
Backbone.Model.prototype.idAttribute = "_id";

// reorder the models in a collection by a list of ids (e.g. from jquery ui sortable)
Backbone.Collection.prototype.reorder = function(order) {
    var new_models = []
    for (var i=0; i < order.length; i++) {
        new_models[i] = this.get(order[i])
    }
    this.models = new_models
    Dispatcher.trigger("resized")
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
    Dispatcher.trigger("resized")
}

// set a view's Bootstrap grid system width according to its model's "width" property 
Backbone.View.prototype.updateWidth = function() {
    this.el.attr('class', this.el[0].className.replace(/\bspan\d+\b/g, ''))
    this.el.addClass("span" + this.model.get("width"))
    Dispatcher.trigger("resized")
}

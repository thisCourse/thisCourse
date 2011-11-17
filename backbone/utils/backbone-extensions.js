
/* ----- Handlebars ----- */

// give access to all templates as partials
Handlebars.partials = Handlebars.templates


/* ----- Backbone ----- */

var Dispatcher = _.extend({}, Backbone.Events)

// change the id attribute to use Mongo's _id
Backbone.Model.prototype.idAttribute = "_id";

// set default data-binding attribute name to "field", globally
Backbone.ModelBinding.Configuration.configureAllBindingAttributes("data")

// a modification to the standard Backbone ModelBinding Convention, so it won't
// overwrite form fields that are currently active (thereby moving cursor to end)
StandardBindingIgnoringActiveInput = (function(Backbone){
    var methods = {}

    var _getElementType = function(element) {
        var type = element[0].tagName.toLowerCase()
        if (type == "input"){
            type = element.attr("type")
            if (type == undefined || type == ''){
                type = 'text'
            }
        }
        return type
    }

    methods.bind = function(selector, view, model, config){
        var modelBinder = this

        view.$(selector).each(function(index){
            var element = view.$(this)
            var elementType = _getElementType(element)
            var attribute_name = config.getBindingValue(element, elementType)

            var modelChange = function(changed_model, val){
                if (!element.is(":focus"))
                    element.val(val)
            }

            var setModelValue = function(attr_name, value){
                var data = {}
                data[attr_name] = value
                model.set(data)
            }

            var elementChange = function(ev){
                setModelValue(attribute_name, view.$(ev.target).val())
            }

            modelBinder.registerModelBinding(model, attribute_name, modelChange)
            modelBinder.registerElementBinding(element, elementChange)

            // set the default value on the form, from the model
            var attr_value = model.get(attribute_name)
            if (typeof attr_value !== "undefined" && attr_value !== null) {
                element.val(attr_value)
            } else {
                var elVal = element.val()
                if (elVal){
                    setModelValue(attribute_name, elVal)
                }
            }
        })
    }

    return methods
})(Backbone)

// set all the "texty" ModelBinding conventions to use the handler defined above
Backbone.ModelBinding.Conventions.text.handler = StandardBindingIgnoringActiveInput
Backbone.ModelBinding.Conventions.textarea.handler = StandardBindingIgnoringActiveInput
Backbone.ModelBinding.Conventions.password.handler = StandardBindingIgnoringActiveInput
Backbone.ModelBinding.Conventions.number.handler = StandardBindingIgnoringActiveInput
Backbone.ModelBinding.Conventions.tel.handler = StandardBindingIgnoringActiveInput
Backbone.ModelBinding.Conventions.search.handler = StandardBindingIgnoringActiveInput
Backbone.ModelBinding.Conventions.url.handler = StandardBindingIgnoringActiveInput
Backbone.ModelBinding.Conventions.email.handler = StandardBindingIgnoringActiveInput


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
Backbone.View.prototype.renderTemplate = function(options) {
    var settings = _.extend({target: this.el, template: this.template}, options)
    settings.data = settings.data || (settings.model && settings.model.attributes)
                                  || (this.model && this.model.attributes) || {}    
    var html = Handlebars.templates[settings.template](settings.data)
    if (settings.target)
        this.$(settings.target).html(html)
    else
        return html
}

// set a view's Bootstrap grid system width according to its model's "width" property 
Backbone.View.prototype.updateWidth = function() {
    this.el.attr('class', this.el[0].className.replace(/\w*\bspan\d+\b/g, ''))
    var width = Math.max(this.model.get("width"), this.editView && this.editView.minwidth || 4) 
    if (isFinite(width))
        this.el.addClass("span" + width)
    Dispatcher.trigger("resized")
}

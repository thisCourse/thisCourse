
/* ----- Handlebars ----- */

// give access to all templates as partials
Handlebars.partials = Handlebars.templates

Handlebars.registerHelper('$date', function(date) {
	date = date_from_string(date)
	return $.datepicker.formatDate('D, M d, yy', date)  
})

// https://gist.github.com/1048968
Handlebars.registerHelper("each_with_index", function(array, fn) {
	var buffer = ""
	for (var i = 0, j = array.length; i < j; i++) {
		var item = array[i]
		item.index = i
		buffer += fn(item)
	}
	return buffer
})

// https://gist.github.com/1048968
Handlebars.registerHelper("join_with_commas", function(array, fn) {
	var buffer = []
	for (var i = 0, j = array.length; i < j; i++) {
		buffer.push(fn(array[i]))
	}
	return buffer.join(" / ")
})

/* ----- Backbone ----- */

var Dispatcher = _.extend({}, Backbone.Events)

// change the id attribute to use Mongo's _id
Backbone.Model.prototype.idAttribute = "_id";

function date_from_string(date) {
	if (date instanceof Date) return date
	date = new Date(date)
	date.setHours(0)
	date.setMinutes(0)
	date.setSeconds(0)
	date.setMilliseconds(0)
	return date
}

Backbone.Model.prototype.getDate = function(attr) {
	var date = this.get(attr)
	if (!date) return undefined
	if (date instanceof Array)
		return _.map(date, date_from_string)
	else
    	return date_from_string(date)
}

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
                                  || (settings.collection)
                                  || (this.model && this.model.attributes)
                                  || (this.collection) || {}  
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

Backbone.View.prototype.enablePlaceholders = function() {
    this.$("[placeholder]").each(function(ind, el) {
        $(el).watermark($(el).attr("placeholder"), {})
        $(el).attr("title", $(el).attr("placeholder"))
    })
}

Backbone.Model.prototype.parse = function(data) {
    //$("#jsoncode").text(JSON.stringify(data))
    return data
}

// add in a "save" event to be fired when a model is saved
Backbone.Model.prototype.save_original = Backbone.Model.prototype.save
Backbone.Model.prototype.save = function() {
    this.trigger("save", this)
    return Backbone.Model.prototype.save_original.apply(this, arguments)
} 

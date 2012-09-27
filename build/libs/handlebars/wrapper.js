var old_Handlebars = window.Handlebars

define(['./handlebars.runtime-1.0.0.beta.6'], function(handlebars) {
	if (old_Handlebars) window.Handlebars = old_Handlebars
})

define(function() {
    
    var buildMap = {}
    
    function loadTemplates(name, parentRequire, load, config) {
    	
    	parentRequire(["text!" + name], function(text) {
    		buildMap[name] = text
    		load(text)
    	})
    
    }
    
    function writeTemplates(pluginName, moduleName, write) {

		var handlebars = require.nodeRequire('handlebars')
				
		var output = []
		
		output.push('(function() {\n  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};\n')

	    var data = buildMap[moduleName]
	
	    var options = {
	      knownHelpers: [],
	    }
		
	    output.push('templates[\'' + template + '\'] = template(' + handlebars.precompile(data, options) + ');\n')
		output.push('})()')	
		output = output.join('')
        
    }
    
    return {
        load: loadTemplates,
        write: writeTemplates
    }

})

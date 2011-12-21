define(function() {
    
    var buildMap = {}
    
    function loadTemplates(name, parentRequire, load, config) {
    	
    	function process_template(text) {
    		buildMap[name] = text
    		var template = Handlebars.compile(text)
    		load(template)    		
    	}
    	
    	if (require.nodeRequire) {
    		Handlebars = require.nodeRequire('handlebars')
    		var fs = require.nodeRequire("fs")
    		var text = fs.readFileSync("/home/jamalex/node/require/src/" + name).toString()
    		process_template(text)
    	} else {
	    	parentRequire(["text!" + name], process_template)    		
    	}
    
    }
    
    function writeTemplates(pluginName, moduleName, write) {

		var handlebars = require.nodeRequire('handlebars')
				
		var output = []
		
		output.push('(function() {\n  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};\n')

	    var data = buildMap[moduleName]
	
	    var options = {
	      knownHelpers: [],
	    }
		
	    output.push('templates[\'' + moduleName + '\'] = template(' + handlebars.precompile(data, options) + ');\n')
		output.push('})()')	
		output = output.join('')
		
		write(output)
        
    }
    
    return {
        load: loadTemplates,
        write: writeTemplates
    }

})

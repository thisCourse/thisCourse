
define(function() {
	
	//>>excludeStart('excludeLESS', pragmas.excludeLESS)    	
    
    var cache = {}
    
    //>>excludeEnd('excludeLESS')
    
    function loadStylesheet(name, parentRequire, callback, config) {
    	
    	if (config.isBuild) {
			// we're in Node, so we need to manually load the helpers
			less = require.nodeRequire('less')
			var fs = require.nodeRequire("fs")
		} else {
			less.sheets.push($('<link rel="stylesheet/less" type="text/css" href="' + parentRequire.toUrl(name + '.less') + '"/>')[0])
            less.refresh()
            callback()
		}

		
    	
    	//>>excludeStart('excludeLESS', pragmas.excludeLESS)
		
    	//>>excludeEnd('excludeLESS')
    	    
    }
    
    function writeStylesheet(pluginName, moduleName, write) {

		//>>excludeStart('excludeLESS', pragmas.excludeLESS)
		
		var output = []
		
		output.push('define("' + pluginName + '_' + moduleName + '", function() {\n  var templates = {};\n  Handlebars.templates = Handlebars.templates || {};\n')

	    var templates = cache[moduleName]
	
	    var options = {
	      knownHelpers: [],
	    }
	    
		for (var i=0; i<templates.length; i++) {
			output.push('  templates[\'' + templates[i].id + '\'] = Handlebars.templates[\'' + moduleName + ':' + templates[i].id + '\'] = Handlebars.template(' + Handlebars.precompile(templates[i].text, options) + ');\n')
		}
	    
		output.push('  return templates;\n})')	
		output = output.join('')
		
		write(output)
		
		//>>excludeEnd('excludeLESS')
        
    }
    
    return {
        load: loadStylesheet,
        write: writeStylesheet
    }
	
})

define(function() {
	
	//>>excludeStart('excludeHandlebars', pragmas.excludeHandlebars)	
	
	if (require.nodeRequire) {
		// we're in Node, so we need to manually load the helpers
		Handlebars = require.nodeRequire('handlebars')
		var fs = require.nodeRequire("fs")
		var htmlparser = require.nodeRequire("htmlparser")
	} else { 
		var htmlparser = Tautologistics.NodeHtmlParser
	}
    	
    function parse_templates(text, callback) {
    	var templates = []
		var handler = new htmlparser.DefaultHandler(function (error, dom) {
		    if (error)
		        throw error
		    else {
		    	for (var i=0; i<dom.length; i++) {
		    		if (dom[i].type!=="script") continue
		    		var template_text = dom[i].children ? dom[i].children[0].raw.trim() : ""
		    		if (!dom[i].attribs)
		    			throw new Error("Template scripts must be identified by an id!" + dom)  
		    		templates.push({
		    			text: template_text,
		    			type: dom[i].attribs.type || "",
		    			id: dom[i].attribs.id
		    		})
		    	}
		    	callback(templates)
		    }
		})
		var parser = new htmlparser.Parser(handler)
		parser.parseComplete(text)
    }
    
    var cache = {}
    
    function loadTemplates(name, parentRequire, callback, config) {

    	function process_templates(text) {
    		parse_templates(text, function(templates) {
    			cache[name] = templates
    			var compiled_templates = {}
    			for (var i=0; i<templates.length; i++) {
    				compiled_templates[templates[i].id] = Handlebars.compile(templates[i].text) 
    			}
    			callback(compiled_templates)
    		})
    	}
    	
        // if (/\.handlebars$/.test(name)==false)
        //     name += ".handlebars"
        
    	if (config.isBuild) {
    		var text = fs.readFileSync(config.appDir + name).toString()
    		process_templates(text)
    	} else {
	    	parentRequire(["text!" + name], process_templates)    		
    	}
    	    
    }
    
    function writeTemplates(pluginName, moduleName, write) {
		
		var output = []
		
		output.push('define("' + pluginName + '!' + moduleName + '", function() {\n  var templates = {};\n  Handlebars.templates = Handlebars.templates || {};\n')

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
		
    }
    
    return {
        load: loadTemplates,
        write: writeTemplates
    }

	//>>excludeEnd('excludeHandlebars')

    return {
        load: function() {}
    }
})

define(function() {
			
	var static_text = ""
	
	var req = function() {}
	
    function loadTemplates(name, parentRequire, callback, config) {
		
		req = parentRequire
		
		// build: read files, concatenate and write out
		// src: append refs to dom

    	if (config.isBuild) {
    		callback()
    	} else {
    		parentRequire([name], function(libs) {
    			for (var i=0; i<libs.length; i++) {
    				document.write(unescape("%3Cscript src='" + parentRequire.toUrl(libs[i] + ".js") + "' type='text/javascript'%3E%3C/script%3E"))
    			}
    			callback()
    		})
    	}
    	    
    }
    
    function writeTemplates(pluginName, moduleName, write) {

    		var fs = require.nodeRequire("fs")
    		req(["nonamd"], function(libs) { console.log(libs) })
    		//parentRequire([name], function(libs) {
    			//console.log(arguments)
    			// for (var i=0; i<libs.length; i++) {
    				// static_text += fs.readFileSync(config.appDir + name + ".js").toString()
    			// }
    			// console.log(static_text)
    			// callback()
    		// })
		
		write(static_text)
		
    }
    
    return {
        load: loadTemplates,
        write: writeTemplates
    }

})

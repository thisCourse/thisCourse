define(function() {	
 
 	//>>excludeStart('excludeLESS', pragmas.excludeLESS)
    
    var less_source = ""
        
    function loadStylesheet(name, parentRequire, callback, config) {
    	
    	
    	if (config.isBuild) {
			less = require.nodeRequire('less')
			var fs = require.nodeRequire('fs')
			less_source = fs.readFileSync(config.appDir + name + ".less", 'utf8')
			less.render(less_source, {paths: ['.', config.appDir, config.dir, config.appDir + name.replace(/[^\/]*$/, "")], compress: true}, function(err, css) {
				if (err) {
					console.log("Error compiling stylesheet '" + name + "':")
					throw err
				}
				var file = fs.openSync(config.dir + "styles.css", 'a')
				// remove comments and double spaces
                css = css.replace(/\/\*(.|\W)*?\*\//g, " ").replace("  ", " ").trim()
                // convert "relative" paths (ones starting with ".") into CSS-file-relative paths
                css = css.replace(/url\((['"]?)\./g, "url($1" + name.split("/").slice(0,-1).join("/") + "/.");
				fs.writeSync(file, "/* " + name + ".less */  " + css + "\n")
				callback()
			})
			callback()
		} else if (typeof(window.less !== "undefined")) {
			less.sheets.push($('<link rel="stylesheet/less" type="text/css" href="' + parentRequire.toUrl(name + '.less') + '"/>')[0])
            less.refresh()
            callback()
		} else
		
		{
			callback()
		}
		
    }
    
    function writeStylesheet(pluginName, moduleName, write) {

		write("define('" + pluginName + "!" + moduleName + "', function() { return; })")
		        
    }
    
    return {
        load: loadStylesheet,
        write: writeStylesheet
    }
	
	//>>excludeEnd('excludeLESS')
	
    return {
        load: function() {}
    }	
	
})


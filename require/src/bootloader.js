// require all the non-AMD libraries, in order, to be bundled with the AMD modules
define(
	[
		"order!libs/underscore/wrapper",
		"order!libs/jquery/jquery",
		"order!libs/jquery/jquery-ui",
		"order!libs/jquery/jquery.jeditable",
		"order!libs/jquery/jquery.watermark",
		"order!libs/json2",
		"order!libs/backbone/backbone",
		"order!libs/backbone/backbone-relational",
		"order!libs/backbone/backbone.memento",
		"order!libs/backbone/backbone.modelbinding",
		"order!libs/handlebars/handlebars.vm",
		"order!libs/bootstrap/bootstrap-buttons",
		"order!libs/fancybox/jquery.fancybox-1.3.4",
		"order!libs/ckeditor/ckeditor",
		"order!libs/ckeditor/adapters/jquery",
		"order!temp",
		"order!app"
	],
	function() {
  		console.log("All modules loaded...")
		require("app").initialize()
  	}
)
    

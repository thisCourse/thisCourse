config = {
    paths: {
        "some": "some/v1.0"
    },
    waitSeconds: 4
}

if (environ==="DEPLOY") {
	config.baseUrl = "build"
} else {
	config.baseUrl = "src"
}

require.config(config)

// require all the non-AMD libraries, in order, to be bundled with the AMD modules
define(
	[
		"order!libs/jquery/jquery",
		"order!libs/jquery/jquery-ui",
		"order!libs/jquery/jquery.jeditable",
		"order!libs/jquery/jquery.watermark",
		"order!libs/json2",
		"order!libs/backbone/backbone",
		"order!libs/backbone/backbone-relational",
		"order!libs/backbone/backbone.memento",
		"order!libs/backbone/backbone.modelbinding",
		"order!libs/handlebars/wrapper",
		"order!libs/bootstrap/bootstrap-buttons",
		"order!libs/fancybox/jquery.fancybox-1.3.4",
		"order!libs/ckeditor/ckeditor",
		"order!libs/ckeditor/adapters/jquery",
		"cs!app"
	], function() {
		console.log("All modules initialized.")
		var app = require("cs!app")
		app.initialize()
	}
)
    

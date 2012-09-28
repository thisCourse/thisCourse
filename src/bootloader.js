config = {
    paths: {
        cs: 'libs/requirejs/cs',
        domReady: 'libs/requirejs/domReady',
        hb: 'libs/requirejs/hb',
        less: 'libs/requirejs/less',
        order: 'libs/requirejs/order',
        text: 'libs/requirejs/text',
        backbone: 'libs/backbone/backbone',
        underscore: 'libs/underscore'
    },
    waitSeconds: 5,
    baseUrl: "."
}

// from http://code.google.com/p/fbug/source/browse/branches/firebug1.5/lite/firebugx.js (to prevent cases, e.g. FF, with no console)
if (!window.console) {
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
    window.console = {};
    for (var i = 0; i < names.length; ++i)
        window.console[names[i]] = function() {}
}

if (environ==="DEPLOY") {
	config.baseUrl = "/build"
} else {
	config.baseUrl = "/src"
}

if (window.less) less.env = "production"

require.config(config)

function clog() {
    if (window.document) console.log.apply(console, arguments)
}

// require all the non-AMD libraries, in order, to be bundled with the AMD modules
define(
	[
        // "order!libs/fancybox/jquery.fancybox-1.3.4",
		"order!libs/jquery/jquery-ui",
		"order!libs/jquery/jquery.jeditable",
		"order!libs/jquery/jquery.watermark",
		"order!libs/json2",
		"order!libs/backbone/backbone",
		"order!libs/backbone/backbone-relational",
		"order!libs/backbone/backbone.memento",
		"order!libs/backbone/backbone.modelbinding",
		"order!libs/handlebars/wrapper",
		//"order!libs/bootstrap/bootstrap-button",
        // "order!libs/bootstrap/bootstrap-tab",
		//"order!libs/ckeditor/ckeditor",
		"order!libs/ckeditor/adapters/jquery",
		"app"
	], function() {
		require("app").start()
        // window.c = new (require("cs!course/models").CourseModel);
        // c.get("page").get("contents").add({test: 55});
        // c.get("page").get("contents").at(0).save()
	}
)

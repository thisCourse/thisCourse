var requirejs = require('requirejs');
var cs = require('coffee-script');

requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require,
    baseUrl: 'require/src',
    paths: {
        cs: 'libs/requirejs/cs',
        domReady: 'libs/requirejs/domReady',
        hb: 'libs/requirejs/hb',
        less: 'libs/requirejs/less',
        order: 'libs/requirejs/order',
        text: 'libs/requirejs/text',
        backbone: 'libs/backbone/backbone'
    }
});

requirejs(["backbone"], function(backbone) {
})

requirejs(["cs!content/routes"], function(routes) {
	console.log("rtoot", routes.initialize)
})

var q = new Backbone.Model({waaaa: 17})
console.log(q.get("waaaa"))

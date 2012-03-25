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

global._ = require("underscore")
global.Backbone = require("backbone")

requirejs(["cs!course/models"], function(coursemodels) {
	var course = new coursemodels.CourseModel({
        _id: "999",
        lectures: [{_id: "1", title: "Tha firsty!", content: {_id: "77", data: "Stuff", html: "yeahhhhhh"}}, {_id: "2"}],
        content: {_id: "17", html: "ooga booga"}
    })
    console.log(course.get("lectures").at(0).toJSON())
})


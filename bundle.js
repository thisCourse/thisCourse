//bundle = module['exports']

var walk = require('walk')
var fs = require('fs')
var options
var walker

options = {
    followLinks: false,
}

walker = walk.walk("backbone", options)

walker.on("file", function (root, fileStats, next) {
    console.log(root + "/" + fileStats.name)
    next()
});
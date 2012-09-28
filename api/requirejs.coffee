requirejs = require('requirejs')

requirejs.config
    nodeRequire: require
    baseUrl: 'src'
    paths:
        cs: 'libs/requirejs/cs'
        hb: 'libs/requirejs/hb'
        less: 'libs/requirejs/less'
        order: 'libs/requirejs/order'
        text: 'libs/requirejs/text'
        backbone: 'libs/backbone/backbone'

global._ = require("underscore")
global.Backbone = require("backbone")
global.clog = (msg) -> 

module.exports = requirejs

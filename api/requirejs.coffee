requirejs = require('requirejs')

requirejs.config
    nodeRequire: require
    baseUrl: 'require/src'
    paths:
        cs: 'libs/requirejs/cs'
        hb: 'libs/requirejs/hb'
        less: 'libs/requirejs/less'
        order: 'libs/requirejs/order'
        text: 'libs/requirejs/text'
        backbone: 'libs/backbone/backbone'

global._ = require("underscore")
global.Backbone = require("backbone")

module.exports = requirejs

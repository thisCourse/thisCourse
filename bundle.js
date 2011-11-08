//bundle = module['exports']

var walk = require('walk')
var fs = require('fs')
var options
var walker

var util = require('util')
var child_process = require('child_process')

function watchDir(rootDir, callback) {

    walker = walk.walk(rootDir)

    console.log("Watching dir:", rootDir)
    fs.unwatchFile(rootDir)
    fs.watchFile(rootDir, function() {
        console.log("Directory changed:", rootDir)
        watchDir(rootDir, callback)
        callback()
    })    

    walker.on("directories", function (root, dirs, next) {
        dirs.forEach(function(dir) {
            var path = root + "/" + dir.name
            console.log("Watching dir:", path)
            fs.unwatchFile(path)
            fs.watchFile(path, function() {
                console.log("Directory changed:", path)
                watchDir(path, callback)
                callback()
            })
        })
        next()
    })

    walker.on("file", function (root, fileStat, next) {
        var path = root + "/" + fileStat.name
        console.log("Watching file:", path)
        fs.unwatchFile(path)
        fs.watchFile(path, function() {
            console.log("File changed:", path)
            callback()
        })            
        next()
    })

}

function compile_handlebar_templates(callback) {
    console.log("Recompiling Handlebar templates...")
    child_process.exec("handlebars ./backbone/templates/*", function(err, stdout, errout) {
        if (err) throw err
        console.log("Handlebar templates compiled; writing to ./public/templates.js")
        fs.writeFile("./public/templates.js", stdout, callback)
    })
}

watchDir("backbone/templates", compile_handlebar_templates)

function compile_less_stylesheets(callback) {
    console.log("Recompiling base less stylesheet...")
    child_process.exec("lessc ./backbone/styles/base.less", function(err, stdout, errout) {
        if (err) throw err
        console.log("Base less template compiled; writing to ./public/base_styles.css")
        fs.writeFile("./public/base_styles.css", stdout, callback)
    })

}

watchDir("backbone/styles", compile_less_stylesheets)


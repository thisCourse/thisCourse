buildr = require 'buildr'
config = {
  srcPath: "backbone"
  outPath: "build"
  #watch: true
  #checkScripts: true
  #checkStyles: true
  #jshintOptions: true
  #csslintOptions: true
  scriptsOrder: [
    "utils/backbone-extensions.js"
    "models/content.js"
    "models/section.js"
    "models/item.js"
    "views/content.js"
    "views/section.js"
    "views/item.js"
  ]
  stylesOrder: [
    "base.less"
  ]
  #bundleScriptPath: "build"
  #bundleStylePath: "build"
  #deleteBundledFiles: true  
}

myBuildr = buildr.createInstance(config)
myBuildr.process (err) ->
  throw err if err
  console.log 'Building completed'


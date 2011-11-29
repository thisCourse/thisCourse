buildr = require 'buildr'
config = {
  srcPath: __dirname+"/backbone"
  outPath: __dirname+"/build"
  watch: true
  #checkScripts: true
  #checkStyles: true
  #jshintOptions: true
  #csslintOptions: true

  #compressScripts: true # Array or true or false
  #compressStyles: true # Array or true or false
  #compressImages: true # Array or true or false

  bundleStylePath: __dirname+'/build/allstyles.css'
  bundleScriptPath: __dirname+'/build/allscripts.js'

  scriptsOrder: [
    "utils/backbone-extensions.js"
    "models/content.js"
    "models/section.js"
    "models/item.js"
    "views/content.js"
    "views/section.js"
    "views/item.js"
    "models/test.coffee"
  ]
  stylesOrder: [
    __dirname+"/backbone/styles/base.less"
  ]
  #bundleScriptPath: "build"
  #bundleStylePath: "build"
  #deleteBundledFiles: true  
}

myBuildr = buildr.createInstance(config)
myBuildr.process (err) ->
  #throw err if err
  console.log 'Building completed'


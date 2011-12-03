(function() {
  var buildr, config, myBuildr;

  buildr = require('buildr');

  config = {
    srcPath: "backbone",
    outPath: "build",
    scriptsOrder: ["utils/backbone-extensions.js", "models/content.js", "models/section.js", "models/item.js", "views/content.js", "views/section.js", "views/item.js"],
    stylesOrder: ["base.less"]
  };

  myBuildr = buildr.createInstance(config);

  myBuildr.process(function(err) {
    if (err) throw err;
    return console.log('Building completed');
  });

}).call(this);

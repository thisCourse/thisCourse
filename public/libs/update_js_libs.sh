# excluding jquery because it should really use the CDN
cd js
curl https://raw.github.com/PaulUithol/Backbone-relational/master/backbone-relational.js > backbone-relational.js
curl https://raw.github.com/documentcloud/underscore/master/underscore.js > underscore.js
curl https://raw.github.com/douglascrockford/JSON-js/master/json2.js > json2.js
curl https://raw.github.com/documentcloud/backbone/master/backbone.js > backbone.js
curl https://raw.github.com/derickbailey/backbone.memento/master/backbone.memento.js > backbone.memento.js
curl https://raw.github.com/derickbailey/backbone.modelbinding/master/backbone.modelbinding.js > backbone.modelbinding.js
#yui-compressor backbone.js > backbone.min.js
#yui-compressor backbone-relational.js > backbone-relational.min.js
#yui-compressor json2.js > json2.min.js


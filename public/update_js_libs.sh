# excluding jquery because it should really use the CDN
curl https://raw.github.com/PaulUithol/Backbone-relational/master/backbone-relational.js > backbone-relational.js
curl https://raw.github.com/documentcloud/underscore/master/underscore-min.js > underscore-min.js
curl https://raw.github.com/documentcloud/underscore/master/underscore.js > underscore.js
curl https://raw.github.com/douglascrockford/JSON-js/master/json2.js > json2.js
curl https://raw.github.com/documentcloud/backbone/master/backbone.js > backbone.js
yui-compressor backbone.js > backbone.min.js
yui-compressor backbone-relational.js > backbone-relational.min.js
yui-compressor json2.js > json2.min.js


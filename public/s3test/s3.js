var knox = require("knox")

var client = knox.createClient({
    key: 'AKIAJLU4UNM7TIOYH6HA',
    secret: '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',
    bucket: 'thiscourse'
})

buf = "hello world!"

var req = client.put('/test/Readme.md', {
    'Content-Length': buf.length
  , 'Content-Type': 'text/plain'
})

req.on('response', function(res){
  if (200 == res.statusCode) {
    console.log('saved to %s', req.url);
  }
})

req.end(buf)


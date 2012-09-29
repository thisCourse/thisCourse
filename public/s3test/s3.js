var knox = require("knox")
var secrets = require("../../secrets")

var client = knox.createClient({
    key: secrets.s3Key,
    secret: secrets.s3Secret,
    bucket: secrets.s3Bucket
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


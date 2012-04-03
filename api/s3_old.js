var crypto = require("crypto")
var async = require('async')
var express = require("express")
var knox = require("knox")

s3 = module['exports']

var client = knox.createClient({
    key: 'AKIAJLU4UNM7TIOYH6HA',
    secret: '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',
    bucket: 'thiscourse'
})

s3.client = client

// attach the various HTTP verbs to the api path (for some reason this.all(...) doesn't work with this pattern)
s3.router = function() {

    this.get("/", handle_s3_creds)
    this.get("/uploaded_image", handle_uploaded_image)
    this.get("/file_redirect", handle_file_redirect)
    
}

policy_params = {
    key: "uploads/${filename}",
    AWSAccessKeyId: "AKIAJLU4UNM7TIOYH6HA",
    acl: "public-read",
    success_action_redirect: "http://127.0.0.1:3000/s3/uploaded"
}

var policy = {
    expiration: "2013-01-01T00:00:00Z",
    conditions: [ 
        {bucket: "thiscourse"},
        ["starts-with", "$key", "uploads/"], // TODO: include user_id before filename, to namespace
        {acl: policy_params.acl},
        //{success_action_redirect: policy_params.success_action_redirect},
        ["content-length-range", 0, 1048576],
        ["starts-with", "$name", ""],
        ["starts-with", "$Filename", ""],
        ["starts-with", "$success_action_status", ""],
    ]
}

policy_params.policy = create_policy(policy)
policy_params.signature = sign_policy(policy_params.policy)

var handle_s3_creds = function(req, res, next) {
    
    res.json(policy_params)
    
}

function dummy() {
	
	var req = {query: {image_key: "uploads/Snow Patrol - Eyes Open (Back).jpg", thumb_key: "uploads/thumb-Snow Patrol - Eyes Open (Back).jpg"}}
	var res = {end: console.log, json: console.log, write: console.log}
	handle_uploaded_image(req,res)
	
}

function handle_uploaded_image(req, res, next) {
    
    var image_key = req.query.image_key
    var thumb_key = req.query.thumb_key
    
    var tasks = {}
    
    if (image_key) {
    	if (image_key.split("/")[0]!="uploads") return APIError(res, "Bad upload path.", 500) // TODO: check that it starts with uploads PLUS username
    	tasks['image'] = function(callback) {
			move_file_to_md5(encodeURIComponent(image_key), "/images/", callback) // TODO: better place to encodeURIComponent?
		}
    }
    
    if (thumb_key) {
    	if (thumb_key.split("/")[0]!="uploads") return APIError(res, "Bad upload path.", 500) // TODO: check that it starts with uploads PLUS username
    	tasks['thumb'] = function(callback) {
			move_file_to_md5(encodeURIComponent(thumb_key), "/images/", callback)
		}
    }
    
	async.parallel(tasks, function(err, results) {
		if (err) return APIError(res, err, 500)
		res.json(results)
	})

}

function move_file_to_md5(key, path, callback) {
	// get the header information, such as etag (md5) and filesize
	head_file(key, function(err, response) {
		
		if (!response.success) return callback("The file '" + key + "' was not found!")
	    
	    var extension = key.split(".").reverse()[0]
	    var filename = path + response.md5 + "." + extension
	    
	    move_file(key, filename, function(err, res) {
	        if (err || res.statusCode != 200) return callback("There was a problem moving the file!")
	        callback(null, {
	        	key: filename,
	        	md5: response.md5,
	        	size: response.headers['content-length'],
	        	uploaded: response.headers.date,
	        	url: client.https(filename),
	        	filename: decodeURIComponent(key).split("/").reverse()[0]
	        })
	    })
	})	
}

function APIError(res, msg, code) {
    code = code || 500
    //res.write(msg)
    console.log("error:", msg)
    res.json({_error: {message: msg, code: code}}, code)
}

function sign_policy(policy) {
    return crypto.createHmac("sha1", '7ytH0P+dwSBxlG5nIIiidBQyE3xvm4+OX/DlwiHq').update(policy).digest(encoding='base64')
}

function create_policy(policy) {
    if (typeof(policy)!=='string') policy = JSON.stringify(policy)
    return new Buffer(policy).toString('base64')
}

function copy_file(source, dest, callback) {
    client.put("/" + dest, {
        'Content-Length': '0',
        'x-amz-copy-source': '/thiscourse/' + source,
        'x-amz-metadata-directive': 'REPLACE'
    }).on('response', function(res) {
      if (typeof(callback)==="function") callback(null, res)
    }).end()
}

function move_file(source, dest, callback) {
    copy_file(source, dest, function(err, res) {
        if (res.statusCode==200) {
            del_file(source, function(err, res_del) {
            	if (res_del.statusCode==204) // no body returned on delete
            		callback(null, res) // return the outer res (from the copy)
            	else
            		callback("Error deleting file '" + source + "'!")
            })
        } else if (typeof(callback)==="function") {
            callback(null, res)
        }
    })
}

function del_file(key, callback) {
    client.del(key).on('response', function(res){
        if (typeof(callback)==="function") callback(null, res)
    }).end()
}

function get_file(key, callback) {
    if (typeof(callback)!=="function") callback = console.log
    var data = ""
    client.get(key).on('response', function(res) {
    	//console.log("Res:", res)
        res.on('data', function(chunk) {
            data += chunk
        }).on('end', function() {
            callback(null, data)
        })
    }).end()
}

function head_file(key, callback) {
    if (typeof(callback)!=="function") callback = console.log
    client.head(key).on('response', function(res) {
    	var response = {headers: res.headers, statusCode: res.statusCode, success: res.statusCode==200} 
    	if (res.headers.etag) response.md5 = res.headers.etag.slice(1,-1)
		callback(null, response)
    }).end()
}

s3.move_file = move_file
s3.copy_file = copy_file
s3.del_file = del_file
s3.get_file = get_file

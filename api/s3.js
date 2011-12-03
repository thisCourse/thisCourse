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
    this.get("/uploaded", handle_uploaded)
    
}

policy_params = {
    key: "uploads/${filename}",
    AWSAccessKeyId: "AKIAJLU4UNM7TIOYH6HA",
    acl: "private",
    success_action_redirect: "http://127.0.0.1:3000/s3/uploaded"
}

var policy = {
    expiration: "2012-01-01T00:00:00Z",
    conditions: [ 
        {bucket: "thiscourse"},
        ["starts-with", "$key", "uploads/"],
        {acl: policy_params.acl},
        //{success_action_redirect: policy_params.success_action_redirect},
        ["content-length-range", 0, 1048576],
        //["starts-with", "$name", ""],
        //["starts-with", "$Filename", ""],
        ["starts-with", "$success_action_status", ""],
    ]
}

policy_params.policy = create_policy(policy)
policy_params.signature = sign_policy(policy_params.policy)

var handle_s3_creds = function(req, res, next) {
    
    res.json(policy_params)
    
}

var handle_uploaded = function(req, res, next) {
    
    if (req.query.key.split("/")[0]!="uploads") return APIError(res, "Bad upload path.", 500)

    var etag = req.query.etag.slice(1,-1)
    var extension = req.query.key.split(".").reverse()[0]
    var filename = "/files/" + etag + "." + extension
    
    move_file(req.query.key, filename, function(response) {
        if (response.statusCode != 200) return APIError(res, "There was a problem uploading the file!", 500)
        res.json({url: "https://thiscourse.s3.amazonaws.com" + filename})
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
      if (typeof(callback)==="function") callback(res)
    }).end()
}

function move_file(source, dest, callback) {
    copy_file(source, dest, function(res) {
        if (res.statusCode==200)
            del_file(source, callback)
        else if (typeof(callback)==="function")
            callback(res)
    })
}

function del_file(key, callback) {
    client.del(key).on('response', function(res){
        if (typeof(callback)==="function") callback(res)
    }).end()
}

function get_file(key, callback) {
    if (typeof(callback)!=="function") callback = console.log
    var data = ""
    client.get(key).on('response', function(res) {
        res.on('data', function(chunk) {
            data += chunk
        }).on('end', function() {
            callback(data)
        })
    }).end()
}

s3.move_file = move_file
s3.copy_file = copy_file
s3.del_file = del_file
s3.get_file = get_file

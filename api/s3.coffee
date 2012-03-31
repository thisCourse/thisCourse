dummy = ->
    req = query:
        image_key: "uploads/Snow Patrol - Eyes Open (Back).jpg"
        thumb_key: "uploads/thumb-Snow Patrol - Eyes Open (Back).jpg"

    res =
        end: console.log
        json: console.log
        write: console.log

    handle_uploaded_image req, res
handle_uploaded_image = (req, res, next) ->
    image_key = req.query.image_key
    thumb_key = req.query.thumb_key
    tasks = {}
    if image_key
        return APIError(res, "Bad upload path.", 500)    unless image_key.split("/")[0] is "uploads"
        tasks["image"] = (callback) ->
            move_file_to_md5 encodeURIComponent(image_key), "/images/", callback
    if thumb_key
        return APIError(res, "Bad upload path.", 500)    unless thumb_key.split("/")[0] is "uploads"
        tasks["thumb"] = (callback) ->
            move_file_to_md5 encodeURIComponent(thumb_key), "/images/", callback
    async.parallel tasks, (err, results) ->
        return APIError(res, err, 500)    if err
        res.json results
move_file_to_md5 = (key, path, callback) ->
    head_file key, (err, response) ->
        return callback("The file '" + key + "' was not found!")    unless response.success
        extension = key.split(".").reverse()[0]
        filename = path + response.md5 + "." + extension
        move_file key, filename, (err, res) ->
            return callback("There was a problem moving the file!")    if err or res.statusCode isnt 200
            callback null,
                key: filename
                md5: response.md5
                size: response.headers["content-length"]
                uploaded: response.headers.date
                url: client.https(filename)
                filename: decodeURIComponent(key).split("/").reverse()[0]
APIError = (res, msg, code) ->
    code = code or 500
    console.log "error:", msg
    res.json
        _error:
            message: msg
            code: code
    , code
sign_policy = (policy) ->
    crypto.createHmac("sha1", "7ytH0P+dwSBxlG5nIIiidBQyE3xvm4+OX/DlwiHq").update(policy).digest encoding = "base64"
create_policy = (policy) ->
    policy = JSON.stringify(policy)    if typeof (policy) isnt "string"
    new Buffer(policy).toString "base64"
copy_file = (source, dest, callback) ->
    client.put("/" + dest,
        "Content-Length": "0"
        "x-amz-copy-source": "/thiscourse/" + source
        "x-amz-metadata-directive": "REPLACE"
    ).on("response", (res) ->
        callback null, res    if typeof (callback) is "function"
    ).end()
move_file = (source, dest, callback) ->
    copy_file source, dest, (err, res) ->
        if res.statusCode is 200
            del_file source, (err, res_del) ->
                if res_del.statusCode is 204
                    callback null, res
                else
                    callback "Error deleting file '" + source + "'!"
        else callback null, res    if typeof (callback) is "function"
del_file = (key, callback) ->
    client.del(key).on("response", (res) ->
        callback null, res    if typeof (callback) is "function"
    ).end()
get_file = (key, callback) ->
    callback = console.log    if typeof (callback) isnt "function"
    data = ""
    client.get(key).on("response", (res) ->
        res.on("data", (chunk) ->
            data += chunk
        ).on "end", ->
            callback null, data
    ).end()
head_file = (key, callback) ->
    callback = console.log    if typeof (callback) isnt "function"
    client.head(key).on("response", (res) ->
        response =
            headers: res.headers
            statusCode: res.statusCode
            success: res.statusCode is 200

        response.md5 = res.headers.etag.slice(1, -1)    if res.headers.etag
        callback null, response
    ).end()
crypto = require("crypto")
async = require("async")
express = require("express")
knox = require("knox")
s3 = module["exports"]
client = knox.createClient(
    key: "AKIAJLU4UNM7TIOYH6HA"
    secret: "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"
    bucket: "thiscourse"
)
s3.client = client
s3.router = ->
    @get "/", handle_s3_creds
    @get "/uploaded_image", handle_uploaded_image

policy_params =
    key: "uploads/${filename}"
    AWSAccessKeyId: "AKIAJLU4UNM7TIOYH6HA"
    acl: "public-read"
    success_action_redirect: "http://127.0.0.1:3000/s3/uploaded"

policy =
    expiration: "2013-01-01T00:00:00Z"
    conditions: [
        bucket: "thiscourse"
    , [ "starts-with", "$key", "uploads/" ],
        acl: policy_params.acl
    , [ "content-length-range", 0, 1048576 ], [ "starts-with", "$name", "" ], [ "starts-with", "$Filename", "" ], [ "starts-with", "$success_action_status", "" ] ]

policy_params.policy = create_policy(policy)
policy_params.signature = sign_policy(policy_params.policy)
handle_s3_creds = (req, res, next) ->
    res.json policy_params

s3.move_file = move_file
s3.copy_file = copy_file
s3.del_file = del_file
s3.get_file = get_file

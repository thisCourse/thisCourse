var $ = require('jquery')
var mongoskin = require('mongoskin')
var mongodb = require('mongodb')
var ObjectId = mongodb.BSONPure.ObjectID
var db = mongoskin.db('localhost/test?auto_reconnect')
var async = require('async')
var express = require("express")

api = module['exports']

var file = new(require('node-static').Server)('./public')

var collections = {}

var courses = collections['courses'] = db.collection('courses')
var grades = collections['grades'] = db.collection('grades')
var docs = collections['docs'] = db.collection('docs')
var test = collections['test'] = db.collection('test')

var id_regex = /[0-9a-fA-F]{24}/
    id_regex.compile(id_regex)

var routing_pattern = '/:collection([a-z]+)/:id([0-9a-fA-F]{24})?:path(*)'

// look through an array and find element (object) with specific _id attribute (optionally replacing id with array index in path)
get_by_id = function(arr, id, path) {
    if (!(arr instanceof Array)) return null
    for (var i=0; i<arr.length; i++) {
        if (arr[i]._id && arr[i]._id.equals(id)) {
            if ((path instanceof Array) && ((ind=path.indexOf(id))>-1))
                path[ind] = i.toString() // swap out id for index, in the path
            return arr[i]
        }
    }
    return null
}

// recursively descend down into an object to find the subobject/field matching a given path (array of field names/ids)
get_by_path = function(obj, path, index) {
    // initialize the index to starting val 0
    if (index===undefined) index = 0
    // if we've reached the end of the path, return result
    if (index >= path.length) return obj
    // if the next item in the path is an id, descend into the array by item id
    if (id_regex(path[index]) && obj instanceof Array) return get_by_path(get_by_id(obj, path[index], path), path, index+1)
    // if we hit a missing property, abort
    if (!obj || !obj.hasOwnProperty(path[index])) return null
    // keep traversing
    return get_by_path(obj[path[index]], path, index+1)
}

// sanitize an object; right now this just removes fields starting with _, but could put html sanitization in here?
recursively_sanitize = function(obj) {
    if (!(obj instanceof Object))
        return obj
    for (key in obj) {
        if (key==="_id")
            obj[key] = new ObjectId()
        else if (key[0]==="_") // || key[0]==="$") // TODO: any risks of allowing $?
            delete obj[key]
        else
            recursively_sanitize(obj[key], true)
    }
    return obj
}

// attach the various HTTP verbs to the api path (for some reason this.all(...) doesn't work with this pattern)
api.router = function() {

    this.get("/", function(req, res) {
        file.serveFile('/api_test.html', 200, {}, req, res)
    })
    
    this.use(express.static(__dirname + '/public'));

    this.get(routing_pattern, request_handler)
        .post(routing_pattern, request_handler)
        .put(routing_pattern, request_handler)
        .del(routing_pattern, request_handler)
}

function wrap_in_object(key, obj) {
    var update = {}
    update[key] = obj
    return update
}

// handle an api request
var request_handler = function(req, res, next) {

    console.log(req.method, req.params.path, req.body)

    req.params.path = req.params.path.split('/').filter(function(m) { return m.length > 0 })
    
    if (!collections.hasOwnProperty(req.params.collection))
        return APIError(res, "Collection '" + req.params.collection + "' does not exist.", 404)
    
    var collection = collections[req.params.collection]
    
    var data = req.body
    
    if ((data instanceof Object) && !(data instanceof Array)) {
         // merge the querystring params into the data body
        //data = $.extend(true, data, req.query)
        // we don't want users to be able to provide their own _id, so clear it
        delete data._id
    }

    // remove fields starting with _ from the data object, except _id fields (which we set to new ObjectId's)
    recursively_sanitize(data)
    
    if (req.params.id===undefined) { // document id was not specified in url (i.e. it references a collection itself)
        
        if (req.params.path.length) // e.g. /api/courses/title/ (no id, but has sub-path)
            return APIError(res, "Invalid URL (document ID not specified or in invalid format).", 405)
    
        if (req.method!='POST') // we may want to allow GET here too, for querying a collection?
            return APIError(res, "Only POST requests are allowed directly on collections.", 405)
        
        // TODO: check permissions
        
        collection.save(data, function(err, obj) {
            res.json(obj) // return the newly created object (or should it just return the _id?)
        })
        
        return
    }
    
    var query = {_id: ObjectId(req.params.id)}
    
    // find the existing object in the database
    collection.find(query).toArray(function(err, arr) {

        if (err)
            return APIError(res, "Error while performing query: " + err.toString(), 500)
        
        if (arr.length==0)
            return APIError(res, "Specified '" + req.params.collection + "' document could not be found!", 404)
        
        var document = arr[0]
        var object = get_by_path(document, req.params.path)
        var object_ref = req.params.path.join('.')
        
        var parent_ref = null;
        var parent_is_array = false;
        if (object_ref) {
            parent_ref = req.params.path.slice(0,-1).join('.')
            if (get_by_path(document, req.params.path.slice(0,-1)) instanceof Array)
                parent_is_array = true
        }
        
        if (object===null)
            return APIError(res, "Specified path could not be found within document!", 404)
                
        // helper function for returning json results
        function mongo_json_response(err, obj) {
            if (err)
                return APIError(res, "Error while performing operation: " + err.toString(), 500)
            if (obj instanceof Object)
                obj = get_by_path(obj, req.params.path)
            else if (data instanceof Object && data._id)
                obj = {_id: data._id }
            else
                obj = {}
            res.json(obj)
        }
        
        function update_and_respond(update_obj) {
            //console.log(query, update_obj)
            collection.update(query, update_obj, {safe: true, upsert: true}, mongo_json_response)
        }
                
        var type = req.method + " ";
        if (object_ref==="") {
            type += "document"
        } else {
            if (object instanceof Array)
                type += "array"
            else if (object instanceof Object)
                type += "object"
            else
                type += "value"
        }        
        
        switch(type) {

            case 'GET document':
            case 'GET array':
            case 'GET object':
            case 'GET value':
                return res.json(object)

            case 'POST document': // replace entire document with new document
                return update_and_respond(data)
            case 'POST array':  // add new element to array (with generated _id, if object), or replace array (if data is an array)
                var operation = '$push'
                if (data instanceof Array) {
                    operation = '$set'
                } else if (data instanceof Object) { 
                    data._id = new ObjectId() // new object's _id won't be autogenerated; need to do it manually
                    
                }
                // build up a $push or $set expression targeting the object path
                return update_and_respond(wrap_in_object(operation, wrap_in_object(object_ref, data)))
            case 'POST object': // replace object with new data (preserving _id if object has one)
                if (object._id)
                    data._id = object._id
                // then, fall through to next:
            case 'POST value':
                // do an in-place update of the field with the new data
                return update_and_respond({$set: wrap_in_object(object_ref, data)})
            
            case 'PUT document': // update document fields (merge/extend into existing)
                // merge the fields specified in data into the existing object (true means recursively)
                $.extend(true, object, data)
                // save the extended (updated) document back to the database
                return update_and_respond(object)
            case 'PUT array': // hmm... use this spot to change order?
                return APIError(res, "Performing PUT on an array is not yet defined (but may be used for sorting in future). " +
                                     "Use POST to add an item to the array, or to overwrite the array with a new one.", 405)
            case 'PUT object': // update subobject with new data object (merge/extend into existing, preserving _id)                
                if (!(data instanceof Object) || (data instanceof Array))
                    return APIError(res, "Cannot PUT a non-object value on top of an object. Use POST if you want to replace the object with this value.", 405)
                // merge the fields specified in data into the existing object (true means recursively)
                data = $.extend(true, object, data)
                // save the extended (updated) object back to the database (by falling through to next)
            case 'PUT value':
                return update_and_respond({$set: wrap_in_object(object_ref, data)})
            
            case 'DELETE document':
                collection.remove(query, {safe: true}, mongo_json_response)
                return                
            case 'DELETE array':
                return update_and_respond({$set: wrap_in_object(object_ref, [])})
            case 'DELETE object':
                if (object._id && parent_is_array)
                    return update_and_respond({$pull: wrap_in_object(parent_ref, {_id: object._id})})
                // fall through and delete as a value if there was no _id
            case 'DELETE value':
                // remove the field from the document
                collection.update(query, {$unset: wrap_in_object(object_ref, 1)}, function(err, obj) {
                    if (parent_is_array)
                        return update_and_respond({$pull: wrap_in_object(parent_ref, null)})
                    else
                        return mongo_json_response(err, obj)
                })
                
                
        }
    })
}

function APIError(res, msg, code) {
    code = code || 500
    res.json({_error: {message: msg, code: code}}, code)
}

// recursive merge, with arrays merged by _id, using the order from the src (new) array 
function merge(dest, src) {

    if (typeof(dest) != 'object')
        return

    for (key in src) {
        if (dest[key]===undefined || typeof(dest[key])==="string" || typeof(dest[key])==="number")
            dest[key] = src[key]
        else if (dest instanceof Array && src instanceof Array)
            dest[key] = merge_arrays(dest[key], src[key])
        else if (typeof(dest[key])=='object' && typeof(src[key])=='object')
            merge(dest[key], src[key])
    }
}

// merge arrays
function merge_arrays(dest, src) {
    var target = []
        
    // both are basic literals
    var src_is_ids = true
    var src_is_objects_with_ids = true
    var src_is_literals = true
    var dest_is_objects_with_ids = true
    var dest_is_literals = true
    for (i in src) {
        if (src_is_ids && !id_regex(src[i]))
            src_is_ids = false
        if (src_is_objects_with_ids && !(typeof(src[i])==='object' && id_regex(src[i]['_id'])))
            src_is_objects_with_ids = false
        if (src_is_literals && (typeof(src[i])==='object'))
            src_is_literals = false
        if (!(src_is_ids || src_is_objects_with_ids || src_is_literals))
            break
    }
    for (i in dest) {
        if (dest_is_objects_with_ids && !(typeof(dest[i])==='object' && id_regex(dest[i]['_id'])))
            dest_is_objects_with_ids = false
        if (dest_is_literals && (typeof(dest[i])==='object'))
            dest_is_literals = false
        if (!(dest_is_objects_with_ids || dest_is_literals))
            break
    }
    // src is ids, and dest is objects with ids: rearrange the dest objects according to src order
    if (src_is_ids && dest_is_objects_with_ids) {
        console.log("src_is_ids && dest_is_objects_with_ids")
        target = Array(src.length)
        var src_ids = {}
        for (i in src)
            src_ids[src[i]] = i
        for (i in dest) {  // write the object into the specified position -- or the end, if id not in src
            var index = src_ids[dest[i]._id]
            if (index === undefined)
                index = target.length
            target[index] = dest[i] 
        }            
    }

    // src is objects, and dest is objects: arrange the dest objects by source order, then stick remaining src objects on end
    if (src_is_objects_with_ids && dest_is_objects_with_ids) {
        console.log("src_is_objects_with_ids && dest_is_objects_with_ids")
        target = Array(src.length)
        var src_ids = {}
        for (i in src)
            src_ids[src[i]._id] = i
        for (i in dest) {
            var index = src_ids[dest[i]._id]
            if (index === undefined)
                target[target.length] = dest[i]
            else {
                target[index] = dest[i]
                merge(target[index], src[index])
                delete src[index]
            }
        }
        for (i in src_ids)
            target.push(src[src_ids[i]])
    }
    
    if (src_is_literals && dest_is_literals) {
        console.log("src_is_literals && dest_is_literals")
        target = dest.concat(src)
    }
    
    target = target.filter(function(e) { return !(e===undefined) })
    
    if (target.length==0) {
        console.log("WARNING: no result of merging " + JSON.stringify(src) + " into " + JSON.stringify(dest))
        return dest
    } else {
        return target
    }
}

api.merge = merge
api.merge_arrays = merge_arrays
api.id_regex = id_regex
/* main request function */

function request(method, url, data, callback) {

    var object = {}
    
    if (callback instanceof Function) callback = [callback]
    
    $.ajax(url, {
        contentType: 'application/json',
        data: data,
        dataType: "json",
        cache: false,
        type: method,
        success: function(data, textStatus, jqXHR) {
            object = data
        },
        error: function(jqXHR, textStatus, errorThrown) {
            object = JSON.parse(jqXHR.responseText)
        },
        complete: function completion(jqXHR, textStatus) {
            console.log('Complete:', method, url + (data ? " " + JSON.stringify(data) : "") + ':\n','\t ',jqXHR.status,JSON.stringify(object))
            for (i in callback)
                callback[i](jqXHR.status, object)
        }
    })

}

/* http verb convenience functions */

function get(url, data, callback) { request("GET", url, data, callback) }
function post(url, data, callback) { request("POST", url, data, callback) }
function put(url, data, callback) { request("PUT", url, data, callback) }
function del(url, data, callback) { request("DELETE", url, data, callback) }

/* condition functions */

function equals(target_object) {
    return function(status, object) {
        assert(recursive_subset(object, target_object))
        assert(recursive_subset(target_object, object))
    }
}

function subset_of(target_object) {
    return function(status, object) {
        assert(recursive_subset(object, target_object))
    }
}

function superset_of(target_object) {
    return function(status, object) {
        assert(recursive_subset(target_object, object))
    }
}

function statuscode(target_status) {
    return function(status, object) {
        assert(status==target_status)
    }
}

function field_is(field, target_value) {
    return function(status, object) {
        assert(recursive_equals(object[field], target_value))
    }
}

/* extra helper functions */

function recursive_equals(obj1, obj2) {
    return recursive_subset(obj1, obj2) && recursive_subset(obj2, obj1)
}

function recursive_subset(obj1, obj2) {
    
    if (typeof(obj1)!=typeof(obj2)) return false
    
    if ((obj1 instanceof Array)!=(obj2 instanceof Array)) return false
    
    if (typeof(obj1)=='number' || typeof(obj1)=='string') return obj1===obj2
    
    for (key in obj1) {
        if (obj1.hasOwnProperty(key) && key!='_id') {
            if (!obj2.hasOwnProperty(key)) return false
            if (!recursive_equals(obj1[key], obj2[key])) return false
        }
    }
    
    return true
}

function assert(condition) {
    if (condition!=true) throw new Error('Assert failed!')
}

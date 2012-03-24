# look through an array and find element (object) with specific _id attribute (optionally replacing id with array index in path)
get_by_id = (arr, id, path) ->
    if arr not instanceof Array then return null
    for obj,i in arr
        if obj._id?.equals?(id) or obj._id==id # compare for ObjectId's, or for plain strings, etc
            if path instanceof Array and (ind=path.indexOf(id)) > -1
                path[ind] = i.toString() # swap out id for index, in the path
            return obj
    return null

# recursively descend down into an object to find the subobject/field matching a given path (array of field names/ids)
get_by_path = (obj, path, index) ->
    # initialize the index to starting val 0
    if not index then index = 0
    # if we've reached the end of the path, return result
    if index >= path.length then return obj
    # if the next item in the path is an id, descend into the array by item id
    if id_regex.exec(path[index]) and obj instanceof Array
    	return get_by_path(get_by_id(obj, path[index], path), path, index+1)
    # if we hit a missing property, abort
    if not obj or path[index] not in obj then return null
    # keep traversing
    return get_by_path(obj[path[index]], path, index+1)

wrap_in_object = (key, obj) ->
    update = {}
    update[key] = obj
    return update

# recursive object merge: put anything that's in src into dest, but leave stuff in dest that's not in src
merge = (dest, src) ->

    # if the dest is empty, just return the src
    if not dest? then return src

    # if either the src or the dest isn't an object, return the dest
    if typeof src isnt 'object' or typeof dest isnt 'object' then return dest

    # loop through all the keys in src, and merge (if objects), or else overwrite, into dest
    for key of src
        if typeof src[key] is 'object' and typeof dest[key] is 'object'
            merge dest[key], src[key]
        else
            dest[key] = src[key]
    
    return dest


module.exports = 
    get_by_id: get_by_id
    get_by_path: get_by_path
    wrap_in_object: wrap_in_object
    merge: merge
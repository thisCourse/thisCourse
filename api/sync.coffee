@model = new @Model({_id: @req.params.id})
@model.fetch
    success: (err, obj) =>
        console.log "got obj:", obj
    error: (err, obj)



Backbone.prototype.fetch = (callback) ->
    
    # for 
    
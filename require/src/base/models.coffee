define ["cs!utils/formatters"], (formatters) ->
    
    idAttribute = Backbone.Model.prototype.idAttribute = "_id"

    slug_fields = ["slug", Backbone.Model.prototype.idAttribute]

    class BaseModel extends Backbone.Model

        url: => # TODO: test this, and make the api endpoint configurable
            if @apiCollection
                return "/api/" + @apiCollection + "/" + (@id or "")

        getDate: (attr) =>
            date = @get(attr)
            if not date
                return undefined
            else if date instanceof Array
                return (formatters.date_from_string(d) for d in date)
            else
                return formatters.date_from_string date
                
        save: =>
            @trigger("save", @)
            # clog "(actual save of", @, "happening in BaseModel)", arguments
            result = super
            # clog "(actual save of", @, "in BaseModel complete)", @id
            return result
        
        slug: =>
            for field in slug_fields
                if field of @attributes
                    return @get(field)
            return ""
        
        matches: (slug) => slug.replace("/", "") in slug_fields

    class LazyModel extends BaseModel

        loaded: false
        loading: false

        constructor: ->
            # clog "CREATING LAZYMODEL INSTANCE", @
            @relations = @relations?() or @relations or {}
            for key,relation of @relations
                if not (relation.model or relation.collection)
                    throw Error("All relations must specify either a model or a collection (key: '" + key + "' in " + @constructor.name + ")")
                if relation.model and (new relation.model) not instanceof Backbone.Model # TODO: check this without creating instance?
                    throw Error("Backbone.Model class expected but found " + relation.model.name)
                if relation.collection and (new relation.collection) not instanceof Backbone.Collection # TODO: " "
                    throw Error("Backbone.Collection class expected but found " + relation.collection.name)
                relation.includeInJSON or= [] # if it's false or non-existent, this will catch it
                relation.includeInJSON.push? Backbone.Model.prototype.idAttribute # we always want to include _id
                # TODO: (probably don't want to do the following -- will save too much in parents; instead, allow POST to absent keys)
                if relation.model and relation.includeInJSON isnt true
                    # to make sure saving of related models doesn't break, include related models all the way down
                    relations = relation.model.prototype.relations?() or relation.model.prototype.relations or {}
                    for relatedkey of relations
                        relation.includeInJSON.push relatedkey
            super

        set: (attr, options) ->
            attr = _.extend({}, attr)
            clog "setting", attr, "on", @
            for key,opts of @relations
                if opts.collection # if it's a "one to many" relation
                    if key not of attr and key not of @attributes then attr[key] = [] # default to an empty collection
                    if (collection = @attributes[key]) instanceof opts.collection
                        for newmodel in attr[key] or []
                            if (oldmodel = @attributes[key].get(newmodel[idAttribute]))
                                oldmodel.set newmodel # update the existing model with the new data
                            else
                                collection.add newmodel # add this new model to the collection
                            # TODO: also delete models in collection that aren't in the new array?
                    else
                        collection = attr[key] = new opts.collection(attr[key]) # turn array into collection
                        includeInJSON = opts.includeInJSON.slice?(0) or opts.includeInJSON # slice to make a copy
                        collection.includeInJSON = includeInJSON
                        parent = {model: @, key: key}
                        # TODO: unbind here first, since we may have been through here before?
                        collection.bind "add", (model) =>
                            # clog "adding parent to", model, "from", @, "at key", key
                            model.parent = parent
                            model.includeInJSON = includeInJSON
                        for model in collection.models # add a parent link to each of the collection's models
                            collection.trigger "add", model
                else if opts.model # if it's a "one to one" relation
                    if key not of attr and key not of @attributes then attr[key] = {} # default to an empty model
                    if _.isString(attr[key]) # if just a string, assume it's an id and put it in an object
                        attr[key] = {_id: attr[key]}
                    if _.isObject(attr[key]) # if it's an object (should be!), then turn it into a model
                        if (oldmodel = @attributes[key]) instanceof opts.model
                            oldmodel.set attr[key]
                        else
                            model = attr[key] = new opts.model(attr[key])
                            model.parent = {model: @, key: key} # add a parent link to the model
                            model.includeInJSON = opts.includeInJSON
            super attr, options

        toJSON: =>
            # first, call the built-in converter in the base class
            attrs = _.extend {}, super
            # if this object is embedded in a denormalized relation, set parent info
            if @parent and @includeInJSON isnt true
                attrs.parent =
                    model: @parent.model.constructor.name
                    apiCollection: @parent.model.apiCollection
                    key: @parent.key
                if @parent.model.id
                    attrs.parent._id = @parent.model.id
                    attrs.parent.url = @parent.model.url?() or @parent.model.url or ""
            for key of attrs
                if key of @relations
                    # convert related collections/models into JSON themselves
                    attrs[key] = attrs[key].toJSON()
                    relation = @relations[key]
                    if relation.includeInJSON is true
                        continue # because nothing to filter out
                    # loop through all models objects and filter out things not in includeInJSON
                    models = attrs[key]
                    if models not instanceof Array
                        models = [models]
                    for model in models
                        for modelkey of model
                            if modelkey not in relation.includeInJSON
                                delete model[modelkey]
            return attrs

        url: =>
            if @parent and @parent.model.url
                url = (@parent.model.url?() or @parent.model.url) + "/" + @parent.key
                if @id and @collection then url += "/" + @id
            else
                url = super
            return url

        save: =>
            # clog "Saving:", @, "at", @url?() or @url, "as", @toJSON(), @id
            if @parent and @parent.model and @parent.model.unsaved()
                @saveRecursive() # TODO: this won't behave nicely if the caller needs the XHR object back, but what can we do?
            else
                if @includeInJSON isnt true 
                    super
                else # we'll skip out on saving this model if it's fully embedded
                    success: (callback) => callback() # TODO: are there any consequences of skipping out here?
        
        saveRecursive: (arguments, callback) =>
            # if the parent is unsaved, save it first
            if @parent and @parent.model and @parent.model.unsaved()
                clog "Parent of", @, "is unsaved, so first saving", @parent.model, @id
                @parent.model.saveRecursive null, =>
                    clog "Finished saving", @parent.model, "(now we can actually save", @, "at", @url?() or @url, ")", @id
                    #BaseModel.prototype.save.apply(@, arguments) # TODO: https://github.com/jashkenas/coffee-script/issues/1606
                    BaseModel.prototype.save.apply(@).success =>
                        clog "saving", @, "is complete", @id
                        callback?()
            else
                @save.apply(@, arguments).success callback
        
        unsaved: => # a model is unsaved (needs saving in order to persist) if it has no id
            @id is undefined
                    
            
    class BaseCollection extends Backbone.Collection

    class LazyCollection extends BaseCollection
        
        


    BaseModel: BaseModel
    LazyModel: LazyModel
    BaseCollection: BaseCollection
    LazyCollection: LazyCollection

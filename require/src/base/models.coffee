define ["cs!utils/formatters"], (formatters) ->
    
    idAttribute = Backbone.Model::idAttribute = "_id"

    # q = (hash_id(nug.id) for nug in app.get("course").get("nuggets").models)
    
    hash_chars = ['b','c','d','f','g','h','j','k','m','n','p','q','r','s','t','v','w','x','z','0','1','2','3','4','5','6','7','8','9']
    
    # hash 12-byte mongodb id down to 4-byte slug; see http://www.mongodb.org/display/DOCS/Object+IDs
    hash_id = (id) ->
        # reverse to put high-variability bytes to left, so they are offset from high-var inc bytes:
        revtime = parseInt(id[0..7].split("").reverse().join(""), 16)
        machpid = parseInt(id[8..15], 16)
        pidinc = parseInt(id[16..23], 16)
        hash = Math.abs(revtime ^ machpid ^ pidinc)
        slug = ""
        base = hash_chars.length
        while (hash)
            slug += hash_chars[hash % base]
            hash = parseInt(hash / base)
        return slug            
            
    get_url = (urlref) ->
        if not urlref then return ""
        if urlref instanceof Function then urlref = urlref()
        return urlref

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
            if not @get("slug") and @get(idAttribute)
                # console.log "filling empty slug"
                @set slug: hash_id(@get(idAttribute)), {silent: true}
            return @get("slug") or ""
        
        matches: (slug) => slug.replace("/", "") in slug_fields

        toJSON: =>
            json = super
            try
                json._course = require("app").get("course").id # TODO: something more elegant?
            catch err
            return json
            
        getKeyWhenReady: (key, callback) =>
            if @has(key) then return callback @get(key)
            performCallback = =>
                if @has(key)
                    @unbind "change:" + key, performCallback
                    callback @get(key)
            @bind "change:" + key, performCallback

    class LazyModel extends BaseModel

        _loaded: false
        loading: false

        loaded: =>
            # clog "CHECKING IF LOADED", @, @includeInJSON==true, @_loaded
            @includeInJSON==true or @_loaded

        constructor: (attributes, options) ->
            # clog "CREATING LAZYMODEL INSTANCE", @
            
            if _.isString(attributes) # if a string is passed instead of an attributes object, assume it's the id and inflate it
                new_attributes = {}
                new_attributes[idAttribute] = attributes
                attributes = new_attributes
                
            @relations = @relations?() or @relations or {}
            for key,relation of @relations
                if not (relation.model or relation.collection)
                    throw Error("All relations must specify either a model or a collection (key: '" + key + "' in " + @constructor.name + ")")
                if relation.model and (new relation.model) not instanceof Backbone.Model # TODO: check this without creating instance?
                    throw Error("Backbone.Model class expected but found " + relation.model.name)
                if relation.collection and (new relation.collection) not instanceof Backbone.Collection # TODO: " "
                    throw Error("Backbone.Collection class expected but found " + relation.collection.name)
                relation.includeInJSON or= [] # if it's false or non-existent, this will catch it
                relation.includeInJSON.push? Backbone.Model::idAttribute # we always want to include _id
                # TODO: (probably don't want to do the following -- will save too much in parents; instead, allow POST to absent keys)
                # if relation.model and relation.includeInJSON isnt true
                #     # to make sure saving of related models doesn't break, include related models all the way down
                #     relations = relation.model::relations?() or relation.model::relations or {}
                #     for relatedkey of relations
                #         relation.includeInJSON.push relatedkey
            super attributes, options

        fetch: =>
            if @loading
                console.log "Model", @, "is already being loaded; aborting 'fetch()'."
                return
            if not @id then return
            @loading = true
            xhdr = super
            xhdr.success =>
                # console.log "successfully loaded", @
                @loading = false
                @_loaded = true
                @trigger "loaded"
            return xhdr

        whenLoaded: (callback) =>
            if @loaded() then return callback()
            @bind "loaded", callback # TODO: unbind?

        set: (key, value, options) ->

            # following is taken from Backbone's set method, to allow for 2 or 3 input args
            if _.isObject(key) or key == null
                attr = key
                options = value
            else
                attr = {}
                attr[key] = value

            if options?.unset
                return super
                
            # TODO: handle other input argument configurations (see backbone.js)
            attr = _.clone(attr)
            #clog "setting", attr, "on", @
            for key,opts of @relations
                # clog "processing relation at key", key, "with options", opts
                if opts.collection # if it's a "one to many" relation
                    # clog "it's a collection relation"
                    if key not of attr and key not of @attributes then attr[key] = [] # default to an empty collection
                    if (collection = @attributes[key]) instanceof opts.collection
                        if attr[key] instanceof opts.collection then attr[key] = attr[key].models # we may have been passed in a collection, but to loop we need an array
                        # clog "collection already exists"
                        for newmodel in attr[key] or []
                            if (oldmodel = collection.get(newmodel[idAttribute]))
                                oldmodel.set newmodel # update the existing model with the new data
                            else
                                # clog "ADDING NEW MODEL TO COLLECTION", collection.length
                                collection.add newmodel # add this new model to the collection
                            # TODO: also delete models in collection that aren't in the new array?
                        delete attr[key] # delete the incoming array so it doesn't clobber the collection in super
                        # TODO: does the above delete prevent some change events from firing?
                    else
                        # clog "turning array into collection"
                        bind_to_collection = => # this was wrapped in a closure so that variables doesn't get clobbered in the loop
                            collection = attr[key] = new opts.collection(attr[key]) # turn array into collection
                            includeInJSON = opts.includeInJSON.slice?(0) or opts.includeInJSON # slice to make a copy
                            collection.includeInJSON = includeInJSON
                            parent = {model: @, key: key}
                            # TODO: unbind here first, since we may have been through here before?
                            collection.bind "add", (model) =>
                                # clog "adding parent to", model, "from", @, "at key", key
                                model.parent = parent
                                model.includeInJSON = includeInJSON
                        bind_to_collection()
                        for model in collection.models # add a parent link to each of the collection's models
                            collection.trigger "add", model
                else if opts.model # if it's a "one to one" relation
                    # clog "it's a model relation"
                    if key not of attr and key not of @attributes then attr[key] = {} # default to an empty model
                    if _.isString(attr[key]) # if just a string, assume it's an id and put it in an object
                        attr[key] = {_id: attr[key]}
                    if _.isObject(attr[key]) # if it's an object (should be!), then turn it into a model
                        if (oldmodel = @attributes[key]) instanceof opts.model
                            if attr[key] instanceof opts.model then attr[key] = attr[key].attributes # we may have been passed in a model, but to loop we need an object
                            # clog "model already exists"
                            oldmodel.set attr[key]
                            delete attr[key] # delete the incoming object so it doesn't clobber the model in super
                            # TODO: does the above delete prevent some change events from firing?
                        else
                            # clog "turning object into model"
                            model = attr[key] = new opts.model(attr[key])
                            model.parent = {model: @, key: key} # add a parent link to the model
                            model.includeInJSON = opts.includeInJSON
            super attr, options

        toJSON: (full) =>
            # first, call the built-in converter in the base class
            attrs = _.extend {}, super
            # if this object is embedded in a denormalized relation, set parent info
            if @parent and (@includeInJSON isnt true)
                attrs.parent =
                    model: @parent.model.constructor.name
                    key: @parent.key
                if @parent.model.apiCollection
                    attrs.parent.apiCollection = @parent.model.apiCollection
                if @parent.model.id
                    attrs.parent._id = @parent.model.id
                    attrs.parent.url = get_url(@parent.model.url)
            for key of attrs
                if key of @relations
                    # convert related collections/models into JSON themselves
                    attrs[key] = attrs[key].toJSON(full)
                    relation = @relations[key]
                    if relation.includeInJSON is true or full # TODO: full is to be used on server side for non-filtered json version
                        continue # because nothing to filter out
                    # loop through all models objects and filter out things not in includeInJSON
                    models = attrs[key]
                    if models not instanceof Array
                        models = [models]
                    for model in models
                        for modelkey of model
                            if modelkey not in relation.includeInJSON and modelkey[0] isnt "_" # TODO: include all _ fields like this?
                                delete model[modelkey]
            return attrs

        url: =>
            if (parent_url = get_url(@parent?.model?.url))
                url = parent_url + "/" + @parent.key
                if @id and @collection then url += "/" + @id
            else
                url = super
            return url

        save: =>
            # clog "Saving:", @, "at", get_url(@url), "as", @toJSON(), @id
            if @parent and @parent.model and @parent.model.unsaved() and @parent.url
                @saveRecursive() # TODO: this won't behave nicely if the caller needs the XHR object back, but what can we do?
            else
                #if @includeInJSON isnt true 
                    super
                #else # we'll skip out on saving this model if it's fully embedded
                #    success: (callback) => callback() # TODO: are there any consequences of skipping out here?
        
        saveRecursive: (arguments, callback) =>
            # if the parent is unsaved, save it first
            if @parent and @parent.model and @parent.model.unsaved() and @parent.url
                clog "Parent of", @, "is unsaved, so first saving", @parent.model, @id
                @parent.model.saveRecursive null, =>
                    clog "Finished saving", @parent.model, "(now we can actually save", @, "at", get_url(@url), ")", @id
                    #BaseModel::save.apply(@, arguments) # TODO: https://github.com/jashkenas/coffee-script/issues/1606
                    BaseModel::save.apply(@).success =>
                        clog "saving", @, "is complete", @id
                        callback?()
            else
                @save.apply(@, arguments).success callback
        
        unsaved: => # a model is unsaved (needs saving in order to persist) if it has no id
            @id is undefined
                    
            
    class BaseCollection extends Backbone.Collection
        
        constructor: ->
            @_bySlug = {}
            super
        
        _addToSlugIndex: (model) =>
            id = model.id or model[idAttribute] or ""
            if not id then return
            slug = model.slug or hash_id(id)
            if _.isFunction(slug) then slug = slug()
            # if slug of @_bySlug
                #console.log "Warning: model with slug", slug, "already existed in collection", @, "(overwriting)"
            if not slug
                console.log "missing", @, slug
                return
            @_bySlug[slug] = id
        
        add: (models, options) =>
            models = if _.isArray(models) then models.slice() else [models]
            for model in models
                @_addToSlugIndex model
            super

        remove: (models, options) =>
            models = if _.isArray(models) then models.slice() else [models]
            for model in models
                delete @_bySlug[model.slug()]
            super

        get: (idOrSlug) =>
            if idOrSlug of @_bySlug then return @get(@_bySlug[idOrSlug])
            replacedSlug = idOrSlug.toLowerCase().replace(/o/g,"0").replace(/i|l/g, "1")
            if replacedSlug of @_bySlug then return @get(@_bySlug[replacedSlug])
            super

        _onModelEvent: (event, model, collection, options) =>
            if model
                if event == 'change:'+model.idAttribute and not model.get("slug")
                    # console.log "id changed"
                    @set slug: model.slug(), {silent: true}
                    @_addToSlugIndex model
                else if event == 'change:slug'
                    delete @_bySlug[model.previous("slug")]
                    # console.log "slug changed", model.previous("slug"), model.slug()
                    @_addToSlugIndex model
            super

    class LazyCollection extends BaseCollection
        
        constructor: ->
            super
            @apiCollection = @model::apiCollection
        
        toJSON: ->
            models = super
            # filter out non-embedded models that are unsaved (to prevent extra id-less instances from being created as a result of recursive saving)
            models = _.filter models, (model) -> model.includeInJSON or idAttribute of model
            return models                    


    BaseModel: BaseModel
    LazyModel: LazyModel
    BaseCollection: BaseCollection
    LazyCollection: LazyCollection

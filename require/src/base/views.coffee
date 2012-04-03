define ["cs!./modelbinding", "less!./styles"], (modelbinding) ->

    class BaseView extends Backbone.View

        events: -> {}

        constructor: (options) ->
            @subviews = {}
            if @events not instanceof Function
                eventobject = @events
                @events = => eventobject
            super
            @$el.addClass @constructor.name
            @visible = true
            if options and options.visible==false
                @hide()
            @url = options.url if options?.url
            @bind_links()
        
        bind_links: ->
            @$el.on "click", "a", (ev) ->
                if ev.shiftKey or ev.ctrlKey then return true # allow ctrl/shift clicks (new tab/window) to pass
                if ev.target.origin != document.location.origin # make external links pop up in a new window
                    ev.target.target = "_blank"
                    return true
                require("app").navigate ev.target.pathname # handle the internal link through Backbone's router, and drop event
                return false # TODO: do we want to make sure our router found a match, else return true?

        show: =>
            if not @visible
                @visible = true
                @$el.show()

        hide: =>
            if @visible
                @visible = false
                @$el.hide()

        close: =>
            @off() # used to be called "unbind"
            @remove() # remove the view's DOM element
            Backbone.ModelBinding.unbind @ # unbind the model bindings
            for name, subview of @subviews
                subview.close?()
            return @
                
        navigate: (fragment) =>
            @fragment = fragment
            for name, subview of @subviews
                #return true if subview.navigate(@fragment)
                subview.navigate(@fragment) # TODO: test if it's inefficient to navigate on ALL THE THINGS
            return false

        add_lazy_subview: (options={}, callback) =>

            if not options.datasource then throw Error("You must specify a datasource ('model' or 'collection') when calling add_lazy_subview:", @)
            
            if not options.view
                clog @, options
                throw Error("You must specify a view class when calling add_lazy_subview:")
            
            if options.datasource is "model" and @model not instanceof Backbone.Model
                throw Error("The parent view must already have @model instantiated when add_subview called with datasource 'model':", @)

            if options.datasource is "collection" and @collection not instanceof Backbone.Collection
                throw Error("The parent view must already have @collection instantiated when add_subview called with datasource 'collection'", @)
            
            viewoptions = options.viewoptions?.slice?(0) or {}
            
            subview_created = false
            
            create_subview_if_ready = =>
                if subview_created then return # TODO: could unbind after success, instead of doing this check here            
                if options.key # if a key was specified, we need to descend
                    obj = @[options.datasource]?.get?(options.key)
                else # otherwise, we pass the whole model/collection along from the parent view
                    obj = @[options.datasource]                
                if obj and (obj instanceof Backbone.Model or obj instanceof Backbone.Collection)

                    do_create_subview = =>
                        subview = new options.view(viewoptions)
                        subview.url = options.url if options.url
                        @add_subview options.name, subview, options.target
                        subview_created = true
                        callback?(subview)
                        $("body").removeClass("wait")
                    
                    if obj instanceof Backbone.Model
                        viewoptions.model = obj
                        if not obj.loaded() # do the lazy loading of the view we're passing down into the view
                            console.log "showing spinner for", @
                            $("body").addClass("wait")
                            xhdr = obj.fetch()
                            if xhdr?.success # TODO: fix this stuff up so it doesn't check so many times
                                xhdr.success do_create_subview
                            else
                                do_create_subview()
                        else
                            do_create_subview()
                    else # it's a collection
                        viewoptions.collection = obj
                        do_create_subview()

            create_subview_if_ready()
            
            console.log "subview_created", @, subview_created
            
            if not subview_created
                if options.datasource is "model"
                    @model.bind "change:" + options.key, create_subview_if_ready
                else if options.datasource is "collection"
                    @collection.bind "add", create_subview_if_ready
                    @collection.bind "change", create_subview_if_ready

        add_subview: (name, view, element) =>
            # close any pre-existing view at this name/slug
            @subviews[name].close?() if name of @subviews
            # create a back-reference to the parent view:
            view.parent = @
            # if the subview doesn't have a url, just use the current view's url:
            view.url or= @url
            # store it in the cache, by name/slug:
            @subviews[name] = view
            # now that we've added a new subview, re-navigate to check if the subview matches fragment:
            if @visible and @fragment # TODO: do we want to do this for non-visible views as well? Probably not?
                @navigate @fragment
            # append the view's element either to the specified target element, or to parent's top-level element
            target = @$(element)
            if not target.length
                target = $(element)
            if not target.length
                target = @$el
            view.render()
            target.append view.el
            #console.log "APPENDED TO", target, view
            return view
        
        close_subview: (name) =>
            @subviews[name]?.close?()
            delete @subviews[name]
        
        # build a context object to be passed to a template for rendering
        context: (extra) =>
            data = _.extend {}, @model?.attributes or {} # mix the model fields into the context, for convenience
            _.extend data, extra
            data['url'] = @url if @url
            data['model'] = @model if @model
            data['collection'] = @collection if @collection
            data['models'] = @collection.models if @collection
            data['id'] = @model.get(Backbone.Model.prototype.idAttribute) if @model
            # data['root_url'] = require('app').get('root_url')
            return data

        # set a view's Bootstrap grid system width according to its model's "width" property 
        updateWidth: =>
            @$el.attr "class", @$el[0].className.replace(/\w*\bspan\d+\b/g, "")
            width = Math.max(@model.get("width"), @editView and @editView.minwidth or 4)
            @$el.addClass "span" + width if isFinite(width)
            require("app").trigger "resized"

        enablePlaceholders: =>
            @$("[placeholder]").each (ind, el) ->
                $(el).watermark $(el).attr("placeholder"), {}
                $(el).attr "title", $(el).attr("placeholder")

        mementoStore: =>
            if not @model then return
            if not @memento
                # don't store the related models in the memento cache, as it breaks it
                params = ignore: (key for key of @model.relations if @model.relations) or []
                @memento = new Backbone.Memento(@model, params)
            @memento.store()

        mementoRestore: =>
            @memento?.restore()

        # resolveLazyRefs: =>
        #     if @resolved then return false # if it's already been resolved, don't try again
        #     if @model instanceof LazyRef and (object = @model.resolve(@parent))
        #         @model = object # point our model to the resolved model from the parent
        #     else if @collection instanceof LazyRef and (object = @collection.resolve(@parent))
        #         @collection = object # point our collection to the resolved collection from the parent
        #     @resolved = true # either we didn't find any LazyRefs or we've resolved them; return and set true
            
    class RouterView extends BaseView
        
        _routeToRegExp: Backbone.Router.prototype._routeToRegExp

        constructor: ->
            @handlers = []
            @subviews = {}
            @routes = @routes?() or @routes # if routes is a function, run it now
            @route(route, callback) for route, callback of @routes # create a handler for each route
            super

        route: (route, callback) =>
            
            # if the callback is a string, look it up as a method of this RouterView
            if _.isString(callback)
                callback = @[callback]
            # if the route isn't a RegExp, turn it into one
            if not _.isRegExp(route)
                route = @_routeToRegExp(route)
            # modify the regex so it will match urls that include trailing splats
            route = new RegExp("(" + route.source.replace("$", "") + ")(.*)$", "i")
            # create a handler for the route, and put it at the front of the handlers array
            @handlers.unshift
                route: route
                callback: (fragment) ->
                    callback route.exec(fragment).slice(2,-1)...
                get_match: (fragment) ->
                    route.exec(fragment)[1]
                get_splat: (fragment) ->
                    route.exec(fragment).slice(-1)[0]
            #alert "handlers on", @, ":", @handlers
        
        navigate: (fragment) =>

            console.log "NAV", @

            # check if fragment matches any of our routes
            for handler in @handlers

                if handler.route.test(fragment)
                    
                    # get the portion of the fragment that matched this pattern:
                    match = handler.get_match(fragment)

                    # get the residual portion of the url
                    splat = handler.get_splat(fragment)

                    # store the residual portion of the url in the view for later re-navigation
                    @fragment = match + splat

                    # get the cached view for this matching fragment (if it exists):
                    subview = @subviews[match]

                    show_and_navigate = (subview) =>
                        # make sure it's visible (hiding all others):
                        view.hide() for route,view of @subviews when not (view is subview)
                        subview?.show?() # TODO: need to find a way to fire this even with add_lazy_subview...
                        # propagate the url fragment down into the subview:
                        success = subview.navigate(splat)

                    if subview
                        show_and_navigate subview
                    else # if we haven't already created a subview for this fragment, then make it so:
                        subviewoptions = handler.callback(fragment) # call the handler to get the subview options
                        subviewoptions.url = @url + match
                        subviewoptions.name = match
                        @add_lazy_subview subviewoptions, show_and_navigate
                        
                    return true

            return false


    BaseView: BaseView
    RouterView: RouterView

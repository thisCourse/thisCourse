define ["cs!./modelbinding", "less!./styles"], (modelbinding) ->

    class BaseView extends Backbone.View

        events: -> {}

        constructor: (options={}) ->
            @subviews = {}
            if @events not instanceof Function
                eventobject = @events
                @events = => eventobject
            super
            @$el.addClass @getClassName()
            @nonpersistent = options.nonpersistent or false
            @visible = true
            if options and options.visible==false
                @hide()
            @url = options.url if options?.url
            @bind_links()
            @closed = false
            #console.log "CONSTRUCTED", @, @model or @collection, @collection and @collection.length
        
        getClassName: => @constructor.name or @constructor.toString().match(/^function\s(.+)\(/)[1]
        
        bind_links: =>
            @$el.on "click", "a", (ev) ->
                pathname = "/" + ev.currentTarget.pathname.replace(/^\/+/,"")
                if ev.shiftKey or ev.ctrlKey then return true # allow ctrl/shift clicks (new tab/window) to pass
                if ev.currentTarget.origin != document.location.origin or pathname.split("/")[1] not in ["course", "src"] # make external links pop up in a new window
                    ev.target.target = "_blank"
                    return true
                require("app").navigate pathname # handle the internal link through Backbone's router, and drop event
                return false # TODO:  do we want to make sure our router found a match, else return true?

        bind_data: =>
            if @model not instanceof Backbone.Model then throw new Error "View must have a model attached before you can bind_data"
            @$("[data][data!='']").each (ind, el) =>
                $el = $(el)
                attr = $el.attr("data")
                switch el.tagName.toLowerCase()
                    when "input", "textarea", "select"
                        $el.val @model.get(attr)
                        elChanged = =>
                            newdata = {}
                            newdata[attr] = $(el).val()
                            @model.set newdata
                        $(el).change elChanged
                        $(el).keyup elChanged
                        @model.bind "change:" + attr, =>
                            if not $el.is(":focus")
                                $el.val @model.get(attr)
                    else
                        $(el).text @model.get(attr)
                        @model.bind "change:" + attr, =>
                            $el.text @model.get(attr)

        show: =>
            if not @visible
                @visible = true
                @$el.show()

        hide: =>
            if @visible
                @visible = false
                if @nonpersistent then @close() else @$el.hide()

        close: =>
            @closed = true
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

        navigateToShow: =>
            require("app").navigate @url?() or @url if @url

        add_lazy_subview: (options={}, callback) =>

            #if not options.datasource then throw Error("You must specify a datasource ('model' or 'collection') when calling add_lazy_subview:", @)
                                    
            if not options.view
                clog @, options
                throw Error("You must specify a view class when calling add_lazy_subview")
            
            if options.datasource is "model" and @model not instanceof Backbone.Model
                throw Error("The parent view must already have @model instantiated when add_subview called with datasource 'model':", @)

            if options.datasource is "collection" and @collection not instanceof Backbone.Collection
                throw Error("The parent view must already have @collection instantiated when add_subview called with datasource 'collection'", @)
            
            # use any remaining options passed in as options for the view
            viewoptions = _.clone options
            delete viewoptions[key] for key in ['datasource', 'view', 'key']
            
            subview_created = false
            
            create_subview_if_ready = =>
                if subview_created then return # TODO: could unbind after success, instead of doing this check here            

                do_create_subview = =>
                    subview = new options.view(viewoptions)
                    @add_subview options.name, subview, options.target
                    subview_created = true
                    callback?(subview)
                    $("body").removeClass("wait")

                if options.key # if a key was specified, we need to descend
                    obj = @[options.datasource]?.get?(options.key)
                else if _.isNumber(options.index)
                    obj = @[options.datasource]?.at?(options.index)
                else if options.datasource # otherwise, we pass the whole model/collection along from the parent view
                    obj = @[options.datasource]                
                else # no datasource specified
                    do_create_subview()
                                        
                #if obj and (obj instanceof Backbone.Model or obj instanceof Backbone.Collection)
                
                if obj instanceof Backbone.Model
                    viewoptions.model = obj
                    if not obj.loaded() # do the lazy loading of the view we're passing down into the view
                        $("body").addClass("wait")
                        xhdr = obj.fetch()
                        if xhdr?.success # TODO: fix this stuff up so it doesn't check so many times
                            xhdr.success do_create_subview
                        else
                            do_create_subview()
                    else
                        do_create_subview()
                else if obj instanceof Backbone.Collection
                    viewoptions.collection = obj
                    do_create_subview()
                    

            create_subview_if_ready()
            
            # console.log "subview_created", @, subview_created
            
            if not subview_created
                @add_subview options.name, new LoadingView, options.target
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
            
            # TODO: commented out the following, and it all seemed to work; hurrr?
            # now that we've added a new subview, re-navigate to check if the subview matches fragment:
            #if @visible and @fragment # TODO: do we want to do this for non-visible views as well? Probably not?
                #@navigate @fragment
            
            # append the view's element either to the specified target element, or to parent's top-level element
            if element
                target = @$(element)
                if not target.length then target = $(element)                
            else
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
            data = _.extend {}, @ # mix the view into the context, for convenience
            data = _.extend data, @model? if @model # mix the model into the context, for convenience
            data = _.extend data, @model?.attributes if @model # mix the model fields into the context, for convenience
            _.extend data, extra
            data['url'] = @url if @url
            data['model'] = @model if @model
            data['collection'] = @collection if @collection
            data['models'] = @collection.models if @collection
            data['course'] = require("app")?.get("course")?.attributes or {}
            data['user'] = require("app")?.get("user")?.attributes or {}
            data['id'] = @model.get(Backbone.Model.prototype.idAttribute) if @model
            # data['root_url'] or= require('app').get('root_url')
            return data

        # set a view's Bootstrap grid system width according to its model's "width" attribute
        updateWidth: =>
            @$el.attr "class", @$el[0].className.replace(/\w*\bspan\d+\b/g, "")
            width = Math.max(@model.getWidth?() or @model.get("width") or 4, @minwidth or 2)
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

    class LoadingView extends BaseView
        
        render: =>
            @$el.html "<b>Loading...</b>"

    class GenericTemplateView extends BaseView
        
        constructor: (options) ->
            if options.template not instanceof Function
                throw "GenericTemplateView's constructor must be passed an options.template."
            @template = options.template
            super
        
        render: =>
            @$el.html @template @context()

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

            # console.log "NAV", @
            
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

                    if subview and not subview.closed
                        show_and_navigate subview
                    else # if we haven't already created a subview for this fragment, then make it so:
                        subviewoptions = handler.callback(fragment) # call the handler to get the subview options
                        subviewoptions.url = @url + match
                        subviewoptions.name = match
                        @add_lazy_subview subviewoptions, show_and_navigate
                        
                    return true

            return false

    class NavRouterView extends BaseView

        tagName: "ul"
        childTagName: "li"
        
        constructor: ->
            @collection = new Backbone.Collection
            super

        createUrl: (slugs) =>
            if slugs instanceof Backbone.Model
                slugs = slugs.slug?() or slugs.get("slug") or slugs.get("slugs") or ""
            url = @url + @pattern
            if _.isString(slugs) then slugs = [slugs]
            for slug in slugs
                url = url.replace(/:\w+/, slug)
            url = url.replace(/:\w+\/$/, "") # remove any residual (unmatched) trailing slug
            url = url.replace("//", "/")
            return url

        addItem: (slug, title, tooltip="") =>
            @collection.add
                slug: slug
                title: title or (slug.substr(0,1).toUpperCase() + slug.substr(1))
                tooltip: tooltip
            @render()

        removeItem: (slug) =>
            @render()            
        
        render: =>
            html = ""
            for model in @collection.models
                html += "<#{@childTagName} title='#{model.get('tooltip')}'><a href='#{@createUrl(model)}'>#{model.get('title')}</a></#{@childTagName}>"
            @$el.html html
            @navigate @subfragment

        navigate: (fragment) =>
            @subfragment = fragment
            @$("a, " + @childTagName).removeClass "active"
            # console.log @url, fragment
            path = @url + fragment
            if not path then return # TODO: why is this needed? (was getting called with @url and fragment both undefined)
            selected = null
            links = @$("a")
            for a in links
                pathname = "/" + a.pathname.replace(/^\//, "")
                if path.slice(0, pathname.length) == pathname # link's url is a prefix of path being navigated
                    if not selected or a.pathname.length > selected.pathname.length # only select link if its url is longer
                        selected = a
            if selected
                $(selected).addClass "active"
                $(selected).parents(@childTagName).first().addClass "active"
                


    BaseView: BaseView
    GenericTemplateView: GenericTemplateView
    RouterView: RouterView
    NavRouterView: NavRouterView

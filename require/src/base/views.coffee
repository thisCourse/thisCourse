define ["cs!./modelbinding"], (modelbinding) ->

    class BaseView extends Backbone.View

        constructor: (options) ->
            @className = @constructor.name
            super
            @subviews = {}
            @visible = options?.visible or true
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
                return true if subview.navigate(@fragment)
            return false

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
            $(element or @$el).append view.el
            return view
        
        # build a context object to be passed to a template for rendering
        context: =>
            data = {}
            data['url'] = @url if @url
            data['model'] = @model if @model
            data['collection'] = @collection if @collection
            return data

        # set a view's Bootstrap grid system width according to its model's "width" property 
        updateWidth: =>
            @el.attr "class", @el[0].className.replace(/\w*\bspan\d+\b/g, "")
            width = Math.max(@model.get("width"), @editView and @editView.minwidth or 4)
            @el.addClass "span" + width if isFinite(width)
            require("app").trigger "resized"

        enablePlaceholders: =>
            @$("[placeholder]").each (ind, el) ->
                $(el).watermark $(el).attr("placeholder"), {}
                $(el).attr "title", $(el).attr("placeholder")

    class RouterView extends BaseView
        
        _routeToRegExp: Backbone.Router.prototype._routeToRegExp

        initialize: =>
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
        
        navigate: (fragment) =>

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

                    # if we haven't already created a subview for this fragment, then make it so:
                    if not subview
                        subview = handler.callback(fragment) # call the handler to get the new View instance
                        subview.url = @url + match
                        subview.render()
                        @add_subview match, subview
                                    
                    # make sure it's visible (hiding all others):
                    view.hide() for route,view of @subviews when not (view is subview)
                    subview.show()

                    # propagate the url fragment down into the subview:
                    success = subview.navigate(splat)

                    return true

            return false

    console.log "base views loaded"

    return {
        BaseView: BaseView
        RouterView: RouterView        
    }

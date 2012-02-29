class window.BaseView extends Backbone.View

    subviews: {}
    visible: true
    
    show: =>
        if not @visible
            @visible = true
            @$el.show()

    hide: =>
        if @visible
            @visible = false
            @$el.hide()
            
    navigate: (fragment) =>
        console.log "further navigating down into: '" + fragment + "'"
        for name, subview of @subviews
            return true if subview.navigate(fragment)

    add_subview: (name, view) =>
        # close any pre-existing view at this name
        @subviews[name].close() if name in @subviews
        # navigate to the residual splat on the new subview
        view.navigate @splat
        # store it in the cache
        @subviews[name] = view
        

class window.RouterView extends BaseView
    
    handlers: []
    subviews: {}
    _routeToRegExp: Backbone.Router.prototype._routeToRegExp

    initialize: =>
        @route(route, callback) for route, callback of @routes
        super  

    route: (route, callback) =>
        # if the callback is a string (not a function), look it up as a method of this RouterView
        if _.isString(callback)
            callback = @[callback]
        # if the route isn't a RegExp, turn it into one
        if not _.isRegExp(route)
            route = @_routeToRegExp(route)
        # modify the regex so it will match urls that include trailing splats
        route = new RegExp("(" + route.source.replace("$", "") + ")(.*?)$", "i")
        @handlers.unshift
            route: route
            callback: (fragment) ->
                callback route.exec(fragment).slice(2,-1)...
            get_match: (fragment) ->
                route.exec(fragment)[1]
            get_splat: (fragment) ->
                route.exec(fragment).slice(-1)
    
    navigate: (fragment) =>
        # check if fragment matches any of our routes
        for handler in @handlers

            if handler.route.test(fragment)
                
                # get the portion of the fragment that matched this pattern:
                match = handler.get_match(fragment)

                # get the cached view for this matching fragment (if it exists):
                subview = @subviews[match]

                # store the residual splat in the view for later propagation:
                @splat = handler.get_splat(fragment)

                # if we haven't already created a subview for this fragment, then make it so:
                if not subview
                    subview = handler.callback(fragment) # call the handler to get the new View instance
                    subview.parent = @
                    subview.url = @url + match
                    subview.render()
                    @$el.append subview.el # append the subview to the view's container
                    @add_subview match, subview
                                
                # make sure it's visible (hiding all others):
                view.hide() for route,view of @subviews when not (view is subview)
                subview.show()

                return true
            
        return false

class LectureRouterView extends RouterView

    render: =>
        #@$el.text("This is the default.")

    routes:
        "lecture/": "create_lecture_list_view"
        "lecture/:lecture_id/": "create_lecture_view"

    create_lecture_list_view: =>
        console.log "create_lecture_list_view"
        return new LectureListView
            #collection: @collection

    create_lecture_view: (lecture_id) =>
        console.log "create_lecture_view " + lecture_id
        return new LectureView
            id: lecture_id
            #model: @collection.get(lecture_id)

class LectureListView extends BaseView
    
    render: =>
        @$el.text("This is the lecture list.")


class LectureView extends BaseView
    
    render: =>
        @$el.text("Loading...")
        setTimeout @actually_render, 500

    actually_render: =>
        @$el.text("This is lecture #" + @options.id)
        @add_subview("pageview", new PageView)
        @$el.append @subviews.pageview.el

class PageView extends RouterView
    
    routes:
        "page/:id/": "create_content_view"
    
    create_content_view: (content_id) =>
        console.log "creating content view!!!"
        new ContentView
            id: content_id

class ContentView extends BaseView
    
    render: =>
        @$el.text("This is page " + @options.id)

window.v = new LectureRouterView
    el: $("body")

v.render()

v.navigate("lecture/122/page/16/")

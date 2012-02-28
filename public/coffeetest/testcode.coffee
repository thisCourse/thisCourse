class window.BaseView extends Backbone.View

    visible: true
    
    show: =>
        if not @visible
            @visible = true
            @$el.show()

    hide: =>
        if @visible
            @visible = false
            @$el.hide()



class window.SubRouter extends Backbone.Router
    handlers: []

    route: (route, name, callback) ->
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


class window.RouterView extends BaseView

    subviews: {}    

	initialize: ->
        @subrouter = new SubRouter
            routes: @routes or {}
        super

    navigate: (fragment) =>

        # check if fragment matches any of our routes
        for handler in @subrouter.handlers

            if handler.route.test(fragment)
                
                # get the portion of the fragment that matched this pattern:
                match = handler.get_match(fragment)

                # get the cached view for this matching fragment (if it exists):
                subview = @subviews[match]

                # if we haven't already created a subview for this fragment, then make it so:
                if not subview
                    subview = handler.callback(fragment) # call the handler to get the new View instance
                    subview.parent = @
                    subview.url = @url + match
                    subview.render()
                    @$el.append subview.el # append the subview to the view's container
                    @subviews[match] = subview

                # propagate remainder of the url down into child view:
                subview.navigate(handler.get_splat(fragment))

                # make sure it's visible (hiding all others):
                view.hide() for view in @subviews when view is not subview
                subview.show()

                return true
            
        return false

class LectureRouterView extends RouterView

    routes:
        "lecture/": "create_lecture_list_view"
        "lecture/:lecture_id/": "create_lecture_view"

    create_lecture_list_view: =>
        return new LectureListView
            collection: @collection

    create_lecture_view: (lecture_id) =>
        return new LectureView
            model: @collection.get(lecture_id)


class LectureRouter extends SubRouter

    routes:
        "lecture/": "show_lecture_list"
        "lecture/:lecture_id/": "show_lecture"
        "lecture/:lecture_id/page/:page_id": "show_lecture"

    show_lecture_list: =>
        #...

    show_lecture: (lecture_id, page_id) =>
        lecture_view = new LectureView({parent: @view, model: @view.model.get("lectures").get(lecture_id)})






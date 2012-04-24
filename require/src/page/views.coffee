define ["cs!base/views", "cs!./models", "cs!content/views", "cs!ui/dialogs/views", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, contentviews, dialogviews, templates, styles) ->

    class PageView extends baseviews.BaseView

        events: -> _.extend super, # TODO: make them ALL like this... nice idiom
            "click .page-button.add-button": "addNewContent"

        showActionButtons: ->
            @$(".page-button").show()

        hideActionButtons: ->
            @$(".page-button").hide()
            return false

        render: =>
            @$el.html templates.page @context()
            #@add_lazy_subview name: "pagerouter", view: PageRouterView, datasource: "model", key: "contents", target: ".contents"
            @add_subview "pagerouter", new PageRouterView(collection: @model.get("contents")), ".contents"
            @add_subview "pagenavrouter", new PageNavRouterView(collection: @model.get("contents")), ".nav-links"
            #if @model.get("_editor") then @makeSortable()

        initialize: ->
            @model.bind "change", @update
            @model.bind "change:_editor", @render
            @render()
            super

        addNewContent: =>
            dialogviews.dialog_request_response "Please enter a title:", (title) =>
                @model.get("contents").create
                    title: title
                    width: 12

        makeSortable: ->
            # @$(".navigation ul").sortable
            #     update: (event, ui) =>
            #         new_order = @$(".navigation ul").sortable("toArray")
            #         @model.get("contents").reorder new_order
            #         @model.save()

            #     opacity: 0.6
            #     tolerance: "pointer"
            #     distance: 5

        close: ->
            @model.unbind "change", @update
            @model.unbind "change:_editor", @render
            super


    class PageRouterView extends baseviews.RouterView
        
        routes: =>
            "": @showFirst
            "page/:id/": @handlePageNavigation

        initialize: ->
            super
            @render()
        
        handlePageNavigation: (content_id) =>
            view: contentviews.ContentView, datasource: "collection", key: content_id
        
        showFirst: =>
            view: contentviews.ContentView, datasource: "collection", index: 0
        
        navigate: =>
            super

    class PageNavRowView extends baseviews.BaseView
        
        tagName: "li"
        
        render: =>
            @$el.html templates.page_nav_row @context()

        initialize: ->
            @model.bind "change:title", @render
            @model.bind "change:_id", @changeId
            @model.bind "change:title", @titleChange
            @$el.attr "id", @model.id
            @render()

        navigate: (fragment) =>
            @$el.toggleClass "active", @model.matches(fragment)

        titleChange: =>
            @titleChanged = true

        changeId: =>
            #@$el.attr "id", @model.id
            @render()

    class PageNavRouterView extends baseviews.NavRouterView
        pattern: "page/:page_id/"
        autoSelectFirst: true
        
        initialize: ->
            @collection.bind "add", @addItem
            
        addItem: (model, collection) =>
            @render()
            @$("a").last().click()
        

    PageView: PageView
    PageRouterView: PageRouterView
    PageNavRowView: PageNavRowView
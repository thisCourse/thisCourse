define ["cs!base/views", "cs!./models", "cs!content/views", "cs!dialogs/views", "hb!./templates.handlebars", "less!./styles"], \
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
            @add_subview "pagerouter", new PageRouterView collection: @model.get("contents"), ".contents"
            if @model.get("_editor") then @makeSortable()

        initialize: ->
            @model.bind "change", @update
            @model.bind "add:contents", @addContents
            @model.bind "remove:contents", @removeContents
            @model.bind "change:_editor", @render
            @render()

        addNewContent: =>
            dialogviews.dialog_request_response "Please enter a title:", (title) =>
                @model.get("contents").create
                    title: title
                    width: 12
                    _editor: true

        addContents: (model, coll) =>
            @add_subview model.cid, new PageNavRowView model: model, ".nav-links"
            require("app").navigate @subviews[model.cid].url()
            
        removeContents: (model, coll) =>
            @close_subview model.cid

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
            @model.unbind "add:contents", @addContents
            @model.unbind "remove:contents", @removeContents
            @model.unbind "change:_editor", @render
            super


    class PageRouterView extends baseviews.RouterView
        
        routes: =>
            "page/:id/": (content_id) => new contentviews.ContentView model: @collection.get(content_id)

        initialize: ->
            @render()
        
        navigate: =>
            clog "NAV ON PAAAAGE ROUTER VIEW"
            super

    class PageNavRowView extends baseviews.BaseView
        
        tagName: "li"
        
        render: =>
            @$el.html templates.page_nav_row @context()

        initialize: ->
            @model.bind "change:title", @render
            @model.bind "change:_id", @changeId
            @model.bind "change:title", @titleChange
            @el.attr "id", @model.id
            @render()

        navigate: (fragment) =>
            alert fragment
            @$el.toggleClass "active", @model.matches(fragment)

        titleChange: ->
            @titleChanged = true

        changeId: ->
            @el.attr "id", @model.id

    PageView: PageView
    PageRouterView: PageRouterView
    PageNavRowView: PageNavRowView
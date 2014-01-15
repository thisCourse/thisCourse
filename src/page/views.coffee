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
            super

        addNewContent: =>
            dialogviews.dialog_request_response "Please enter a title:", (title) =>
                if @model.isNew()
                    @model.save().success => @createNewContent(title)
                else
                    @createNewContent(title)

        createNewContent: (title) =>
            @model.get("contents").create
                title: title
                width: 12
                {wait: true}

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
            "page/:id/": @handlePageNavigation

        initialize: ->
            super
            @render()
        
        handlePageNavigation: (content_id) =>
            view: contentviews.ContentView, datasource: "collection", key: content_id
                
        navigate: =>
            super


    class PageNavRouterView extends baseviews.NavRouterView
        pattern: "page/:page_id/"
        
        events:
            "click .delete-button": "deleteProbe"

        
        render: =>
            html = ""
            for model in @collection.models
                console.log model
                html += "<#{@childTagName} title='#{model.get('tooltip')}'> <button id ='#{model.id}' class='section-button delete-button btn danger'>X</button><a href='#{@createUrl(model)}'>#{model.get('title')}</a></#{@childTagName}>"
            @$el.html html
            @navigate @subfragment, @query
            
            

        navigate: (fragment) =>
            links = @$("a")
            if links.length and fragment is ""
                require("app").navigate links[0].pathname, replace: true
            else
                super
        
        initialize: ->
            @collection.bind "add", @addItem
            @collection.bind "remove", @render
            
        addItem: (model, collection) =>
            @render()
            @$("a").last().click()
        
        deleteProbe: (ev) =>
            console.log ev 
            probe = @collection.get(ev.target.id)
            dialogviews.delete_confirmation probe, "probe", =>
                probe.destroy()
                probe.parent.model.save()

    PageView: PageView
    PageRouterView: PageRouterView
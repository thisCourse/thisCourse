define ["cs!base/views", "hb!./templates.handlebars","cs!ui/dialogs/views"], (baseviews, templates,dialogviews) ->

    class ItemView extends baseviews.BaseView
        tagName: "span"
        className: "ItemView"

        render: ->
            @$el.html ""
            @add_subview "displayview", new @DisplayView(model: @model)
            @$el.append templates.item_buttons()
            @updateWidth()

        events: ->
            "click .edit-button": "edit"
            "click .delete-button": "delete"
            "mouseenter": "showActionButtons"
            "mouseleave": "hideActionButtons"

        initialize: ->
            if not @DisplayView
                throw new Error @getClassName() + " does not have a DisplayView specified (must be a subclass of ItemDisplayView)."
            if not @EditView
                throw new Error @getClassName() + " does not have an EditView specified (must be a subclass of ItemEditView)."
            @model.bind "change:width", @updateWidth

        showActionButtons: =>
            if @subviews.editview and not @subviews.editview.closed then return
            @$(".item-button").show()

        hideActionButtons: =>
            @$(".item-button").hide()

        edit: =>
            @hideActionButtons()
            @add_subview "editview", new @EditView(model: @model)
            if @subviews.editview instanceof ItemEditInlineView
                @subviews.displayview.hide()
            return false
            
        delete: =>
            if @model.get("image_url") or @model.get("html")
                dialogviews.delete_confirmation @model, "item", =>
                    @model.destroy()
            else
                @model.destroy()

    class ItemDisplayView extends baseviews.BaseView
        className: "ItemDisplayView"

        render: =>
            

        initialize: ->
            @model.bind "change", @render

        close: =>
            @model.unbind "change", @render
            super


    class ItemEditView extends baseviews.BaseView
        
        render: =>
            Backbone.ModelBinding.bind @

        events: -> _.extend super,
            "click .save": "save"
            "click .cancel": "cancel"
            "change input": "change"

        initialize: ->
            @memento = new Backbone.Memento(@model)
            @memento.store()

        focusFirstInput: =>
            _.defer -> @$("input:first").focus()

        save: =>
            # alert @model.get("title")
            @$("input").blur()
            @$(".save.btn").button "loading"
            @model.save {},
                success: =>
                    @$(".save.btn").button "complete"
                    @saved()

                error: (model, err) =>
                    msg = "An unknown error occurred while saving. Please try again."
                    switch err.status
                        when 0
                            msg = "Unable to connect; please check internet connectivity and then try again."
                        when 404
                            msg = "The object could not be found on the server; it may have been deleted."
                    @$(".errors").text msg
                    @$(".save.btn").button "complete"

        saved: =>

        cancel: =>
            @memento.restore()
            if not @model.id then @model.destroy() # TODO: "remove()"?
            @close()

        change: (ev) ->

        close: =>
            @model.editing = false
            @parent.updateWidth()
            super

    class ItemEditInlineView extends ItemEditView
        className: "ItemEditView ItemEditInlineView"

        minwidth: 6

        render: => 
            super
            _.defer @parent.updateWidth

        events: => _.extend super,
            "keyup input": "keyup"

        keyup: (ev) ->
            if ev.metaKey or ev.shiftKey or ev.altKey or ev.ctrlKey
                return # we don't want to confuse, e.g., ALT-ESC with a canceling action
            switch ev.which
                when 13 then @save()
                when 27 then @cancel()

        saved: ->
            @close()

        close: ->
            super
            @parent.subviews.displayview.show() # TODO: handle this in parent, with subview stuff

        
    class ItemEditPopupView extends ItemEditView
        className: "ItemEditView ItemEditPopupView"

        render: ->
            super

        events: -> _.extend super,
            "focus input": "scrollToShow"
            "keyup input": "keyup"
            "mouseenter": "bringToTop"

        initialize: ->
            super
            @scrollToShow()
            require("app").bind "resized", @reposition

        close: =>
            require("app").unbind "resized", @reposition
            super

        change: =>
            super

        keyup: (ev) =>
            $(ev.target).change() # trigger a change event for every keypress, for the sake of the data binding
            switch ev.which
                when 13 then @save()
                when 27 then @cancel()

        bringToTop: =>
            $(".item-edit-popup").css "z-index", 50
            @$el.css "z-index", 100

        saved: =>
            @$el.animate opacity: 0, 300, @close

        scrollToShow: =>
            $("html, body").stop()
            _.defer =>
                
                current_scroll = $("body").scrollTop()
                
                # start by assuming we'll leave the offset where it is
                target_scroll_offset = current_scroll

                # if we're scrolled down too far, or the element is taller than the viewport, then scroll up until the element's top is visible
                if current_scroll > @$el.offset().top or @$el.height() > $(window).height()
                    console.log "scroll up"
                    target_scroll_offset = @$el.offset().top                                
                # if we're scrolled up too far and the element's bottom is cut off, scroll down to show the element's bottom
                else if current_scroll + $(window).height() < @$el.offset().top + @$el.height() #+ 30
                    console.log "scroll down", @$el.offset().top, @$el.height(), $(window).height()
                    target_scroll_offset = @$el.offset().top + @$el.height() - $(window).height() #+ 30
                
                # smoothly scroll to the target offset
                if target_scroll_offset > 0 and target_scroll_offset != current_scroll
                    console.log "scrolling to " + target_scroll_offset
                    $("html, body").stop().animate scrollTop: target_scroll_offset, 400


    ItemView: ItemView
    ItemDisplayView: ItemDisplayView
    ItemEditInlineView: ItemEditInlineView
    ItemEditPopupView: ItemEditPopupView
    
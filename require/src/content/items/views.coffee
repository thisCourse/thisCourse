define ["cs!base/views", "hb!./templates.handlebars"], (baseviews) ->

    class ItemView extends baseviews.BaseView
        tagName: "span"

        render: ->
            #@renderTemplate target: ".item-inner"
            @updateWidth()

        events: ->
            "click .edit-button": "edit"
            "click .delete-button": "delete"
            "mouseenter .item-inner": "showActionButtons"
            "mouseleave .item-inner": "hideActionButtons"

        initialize: ->
            @model.bind "change", @change
            @renderTemplate template: "item-container"
            @change()

        showActionButtons: =>
            return @$(".item-button").not(".drag-button").stop().fadeIn(50) if @model.editing
            @$(".item-button.drag-button").stop().fadeIn 200

        hideActionButtons: =>
            @$(".item-button").stop().fadeOut 50

        edit: => #_.debounce(->
            @add_subview "editview", new ItemEditViews[@type] model: @model # TODO
            @hideActionButtons()
        #, 100)

        delete: =>
            @model.destroy()

        close: =>
            @model.unbind "change", @render
            super

        change: =>
            @render()

    class ItemEditView extends baseviews.BaseView
        
        render: =>
            Backbone.ModelBinding.bind @

        events: ->
            "click .save": "save"
            "click .cancel": "cancel"
            "change input": "change"

        initialize: ->
            @memento = new Backbone.Memento(@model)
            @memento.store()

        focusFirstInput: =>
            _.defer -> @$("input:first").focus()

        save: =>
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
        

        
    class ItemEditPopupView extends ItemEditView

        render: ->
            super

        events: ->
            "focus input": "scrollToShow"
            "keyup input": "keyup"
            "mouseenter": "bringToTop"

        initialize: ->
            super
            @reposition()
            @scrollToShow()
            require("app").bind "resized", @reposition

        close: ->
            require("app").unbind "resized", @reposition
            super

        change: =>
            super
            @reposition()

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

        reposition: (duration) =>
            duration or= 0
            pos = @parent.$el.offset()
            top = pos.top + @parent.$el.height()
            left = pos.left
            @$el.stop().animate left: left, top: top, duration, "swing", @scrollToShow

        scrollToShow: =>
            $("html, body").stop()
            _.defer =>
                target_scroll_offset = $("body").scrollTop()
                if $(window).height() + $("body").scrollTop() < @$el.offset().top + @$el.height() + 30
                    target_scroll_offset = @$el.offset().top + @$el.height() - $(window).height() + 30
                if $("body").scrollTop() > @$el.offset().top
                    target_scroll_offset = @$el.offset().top
                if target_scroll_offset > 0 and target_scroll_offset != $("body").scrollTop()
                    $("html, body").stop().animate scrollTop: target_scroll_offset, 400


    ItemView: ItemView
    ItemEditView: ItemEditView
    ItemEditInlineView: ItemEditInlineView
    ItemEditPopupView: ItemEditPopupView
    
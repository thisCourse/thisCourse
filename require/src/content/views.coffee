define ["less!./styles", "cs!base/views", "cs!dialogs/views", "cs!./models", "hb!./templates.handlebars"], \
        (styles, baseviews, dialogviews, models, templates) ->

    class ContentView extends baseviews.BaseView

        className: "content"
        
        events:
            "click .content-button.add-button": "addNewSection"

        render: =>
            @$el.html templates.content @context()
            # if @model.get("_editor")
            #     @makeEditable()
            #     @makeSortable()
            @update()
            for model in @model.get("sections").models
                @addSections model, @model.get("sections")

        initialize: =>
            @model.bind "change", @update
            @model.get("sections").bind "add", @addSections
            @model.get("sections").bind "remove", @removeSections
            @model.bind "save", @saved
            @render()

        showActionButtons: =>
            @$(".content-button").show()

        hideActionButtons: =>
            @$(".content-button").hide()
            return false

        addNewSection: =>
            new_section = type: @$(".add-section-type").val()
            new_section.width = @model.get("width") if @model.get("width")
            # alert "about to create new section"
            @model.get("sections").create new_section
            clog @model.get("sections")

        addSections: (model, coll) =>
            @add_subview model.cid, new SectionView(model: model), ".sections"
            # see views/content.js for hack to make sure these are inserted in the right order

        removeSections: (model, coll) =>
            @subviews[model.cid].$el.stop().show().fadeOut 300, =>
                @close_subview model.cid

        makeEditable: =>
            # @$(".title").editable (new_value) =>
            #     @model.set(title: new_value).save()
            # ,
            #     submit: "Save"
            #     cancel: "Cancel"
            #     event: "dblclick"
            #     cssclass: "jeditable"
            #     tooltip: "Double click to edit"
            #     onedit: =>
            #         _.defer =>
            #             @$(".jeditable button").addClass("btn").css "margin-left", 5

        makeSortable: =>
            # @$(".sections").sortable
            #     update: (event, ui) =>
            #         new_order = @$(".sections").sortable("toArray")
            #         @model.get("sections").reorder new_order
            #         @model.save()

            #     opacity: 0.6
            #     tolerance: "pointer"
            #     handle: ".drag-button"

        update: =>
            @$(".title").text @model.get("title")

    class SectionView extends baseviews.BaseView
        
        className: "section border2"
        
        buttonFadeSpeed: 60
        
        render: =>
            @$el.html templates.section @context
            @makeSortable()
            @update()
            for model in @model.get("items").models
                @addItems model, @model.get("items")


        events: -> _.extend super,
            "mouseenter .section-inner": "showBottomActionButtons"
            "mouseleave .section-inner": "hideAllActionButtons"
            "mouseenter .sectiontitle": "showTopActionButtons"
            #"mouseout .sectiontitle": "hideTopActionButtons"
            "mouseenter .items": "hideTopActionButtons"
            "click .section-button.add-button": "addNewItem"
            "click .section-button.delete-button": "delete"

        showBottomActionButtons: =>
            # @$(".section-button.add-button").stop().hide().fadeIn @buttonFadeSpeed
            @$(".section-button.add-button").show()

        hideBottomActionButtons: =>
            # @$(".section-button.add-button").stop().show().fadeOut @buttonFadeSpeed
            @$(".section-button.add-button").hide()

        showTopActionButtons: =>
            # @$(".section-button.drag-button").stop().hide().fadeIn @buttonFadeSpeed
            # @$(".section-button.delete-button").stop().show().fadeIn @buttonFadeSpeed
            @$(".section-button.drag-button").show()
            @$(".section-button.delete-button").show()

        hideTopActionButtons: =>
            # @$(".section-button.drag-button").stop().hide().fadeOut @buttonFadeSpeed
            # @$(".section-button.delete-button").stop().show().fadeOut @buttonFadeSpeed
            @$(".section-button.drag-button").hide()
            @$(".section-button.delete-button").hide()

        hideAllActionButtons: =>
            # @$(".section-button").stop().show().fadeOut @buttonFadeSpeed
            @$(".section-button").hide()

        initialize: ->
            #@model.set _editor: app.get("_editor")
            @$el.attr "id", @model.id
            @model.bind "change", @update
            @model.get('items').bind "add", @addItems
            @model.get('items').bind "remove", @removeItems
            @model.bind "change:width", @updateWidth
            @updateWidth()

        makeSortable: =>
            # @$(".items").sortable
            #     update: (event, ui) ->
            #         new_order = @$(".items").sortable("toArray")
            #         @model.get("items").reorder new_order
            #         self.model.save()

            #     opacity: 0.6
            #     tolerance: "pointer"
            #     handle: ".drag-button"

        addNewItem: =>#_.throttle =>   
            @model.get("items").add {}
        #, 500
        
        edit: =>
            alert "editing! " + @model.attributes

        delete: =>
            if @model.get("items").length
                dialogviews.delete_confirmation @model, "section", =>
                    @model.destroy()
            else
                @model.destroy()

        addItems: (model, coll) =>
            type = model.get("type") or @model.get("type") or "freeform"
            itemviews = require("cs!content/items/" + type + "/views")
            view = new itemviews.ItemView(model: model)
            @add_subview model.cid, view, ".items"
            if not model.id
                view.edit()

        removeItems: (model, coll) =>
            @subviews[model.cid].$el.stop().show().fadeOut 300, =>
                @close_subview model.cid

        update: =>
            @$(".sectiontitle").text @model.get("title")


    ContentView: ContentView
    SectionView: SectionView
    

require ["cs!content/items/freeform/views", "cs!content/items/gallery/views"], (itemviews) => console.log("got the itemviews", itemviews)
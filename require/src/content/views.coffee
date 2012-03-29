define ["less!./styles", "cs!base/views", "cs!./models"], (styles, baseviews, models) ->

    class ContentView extends baseviews.BaseView

        events:
            "click .content-button.add-button": "addNewSection"

        render: ->
            @renderTemplate()
            if @model.get("_editor")
                @makeEditable()
                @makeSortable()
            @update()
            this

        initialize: ->
            @model.bind "change", @update, this
            @model.bind "add:sections", @addSections, this
            @model.bind "remove:sections", @removeSections, this
            @model.bind "change:_editor", @render, this
            @model.bind "save", @saved, this
            @render()

        showActionButtons: =>
            @$(".content-button").show()

        hideActionButtons: =>
            @$(".content-button").hide()
            return false

        addNewSection: =>
            new_section = type: @$(".add-section-type").val()
            new_section.width = @model.get("width") if @model.get("width")
            @model.get("sections").create new_section

        addSections: (model, coll) =>
            @add_subview model.cid, new SectionView model: model, ".sections"
            # see views/content.js for hack to make sure these are inserted in the right order

        removeSections: (model, coll) =>
            @subviews[model.cid].$el.fadeOut 300, =>
                @close_subview model.cid

        makeEditable: ->
            # @$(".title").editable (new_value) ->
            #     self.model.set(title: new_value).save()
            # ,
            #     submit: "Save"
            #     cancel: "Cancel"
            #     event: "dblclick"
            #     cssclass: "jeditable"
            #     tooltip: "Double click to edit"
            #     onedit: ->
            #         _.defer ->
            #             self.$(".jeditable button").addClass("btn").css "margin-left", 5

        makeSortable: ->
            # self = this
            # @$(".sections").sortable
            #     update: (event, ui) ->
            #         new_order = self.$(".sections").sortable("toArray")
            #         self.model.get("sections").reorder new_order
            #         self.model.save()

            #     opacity: 0.6
            #     tolerance: "pointer"
            #     handle: ".drag-button"

        update: ->
            @$(".title").text @model.get("title")


        ContentView: ContentView
    

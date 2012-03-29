define ["cs!base/views", "cs!./models", "cs!page/views", "cs!content/items/views", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, pageviews, itemviews, templates, styles) ->

    class AssignmentRouterView extends baseviews.RouterView

        routes: =>
            "": => new AssignmentListView collection: @collection
            ":assignment_id/": (assignment_id) => new AssignmentView model: @collection.get(assignment_id)

    class AssignmentListView extends baseviews.BaseView

        events:
            "click .add-button": "addNewAssignment"
            "click .delete-button": "addNewAssignment"

        render: =>
            @$el.html templates.assignment_list @context()
            @makeSortable()

        addNewAssignment: =>
            dialog_request_response "Please enter a title:", (title) =>
                @collection.create title: title

        deleteAssignment: (ev) ->
            assignment = @collection.get(ev.target.id)
            delete_confirmation assignment, "assignment", =>
                @collection.remove assignment

        makeSortable: ->
            # @$("ul").sortable
            #     update: (event, ui) ->
            #         new_order = self.$("ul").sortable("toArray")
            #         self.collection.reorder new_order
            #         app.course.save()

            #     opacity: 0.6
            #     tolerance: "pointer"

    class AssignmentView extends baseviews.BaseView

        events:
            "click .edit-button": "edit"

        render: =>
            @$el.html templates.assignment @context()
            @add_subview "topview", new AssignmentTopView(model: @model), ".assignment-top"
            @add_subview "pageview", new pageviews.PageView(model: @model.get("page")), ".assignment-page"

        edit: =>
            @subviews.topview.hide()
            @add_subview "topeditview", new AssignmentTopEditView(model: @model), ".assignment-top"
        
        editDone: =>
            @close_subview "topeditview"
            @subviews.topview.show()

    class AssignmentTopView extends baseviews.BaseView
        
        initialize: -> @render()

        events: => _.extend super,
            "click .edit-button": "edit"
        
        render: =>
            @$el.html templates.assignment_top @context()
            Backbone.ModelBinding.bind @

        edit: =>
            @parent.edit()

    class AssignmentTopEditView extends baseviews.BaseView

        initialize: ->
            @mementoStore()
            @render()
        
        render: =>
            @$el.html templates.assignment_top_edit @context()
            Backbone.ModelBinding.bind @
            @enablePlaceholders()
            due = @model.getDate("due")
            @$(".due-date").val (due.getMonth() + 1) + "/" + due.getDate() + "/" + due.getFullYear() if due
            @$(".due-date").datepicker onSelect: (date) ->
                $(".due-date:visible").val date

        events: #-> _.extend super,
            "click button.save": "save"
            "click button.cancel": "cancel"

        save: =>
            due = $(".due-date:visible").val() or null
            due = new Date(due) if due
            @model.set due: due
            @$("input").blur()
            @$(".save.btn").button "loading"

        cancel: =>
            @mementoRestore()
            @parent.editDone()

            
    AssignmentRouterView: AssignmentRouterView
    AssignmentListView: AssignmentListView
    AssignmentView: AssignmentView
    AssignmentTopView: AssignmentTopView
    AssignmentTopEditView: AssignmentTopEditView
    
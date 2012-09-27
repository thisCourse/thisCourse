define ["cs!base/views", "cs!./models", "cs!page/views", "cs!content/items/views", "cs!ui/dialogs/views", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, pageviews, itemviews, dialogviews, templates, styles) ->

    class AssignmentRouterView extends baseviews.RouterView

        routes: =>
            "": => view: AssignmentListView, datasource: "collection"
            ":assignment_id/": (assignment_id) => view: AssignmentView, datasource: "collection", key: assignment_id

        initialize: ->
            console.log "AssignmentRouterView init"
            super

    class AssignmentListView extends baseviews.BaseView

        events:
            "click .add-button": "addNewAssignment"
            "click .delete-button": "addNewAssignment"

        render: =>
            console.log "rendering AssignmentListView"
            @$el.html templates.assignment_list @context()
            @makeSortable()
            
        initialize: ->
            console.log "init AssignmentListView"
            @collection.bind "change", @render
            @collection.bind "remove", @render
            @collection.bind "add", @render

        addNewAssignment: =>
            dialogviews.dialog_request_response "Please enter a title:", (title) =>
                @collection.create title: title

        deleteAssignment: (ev) =>
            assignment = @collection.get(ev.target.id)
            dialogviews.delete_confirmation assignment, "assignment", =>
                @collection.remove assignment

        # assignmentAdded: (model, coll) =>
        #     alert "added"
        #     @$('ul').append("<li>" + model.get("title") + "</li>")

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
            @add_lazy_subview name: "pageview", view: pageviews.PageView, datasource: "model", key: "page", target: ".assignment-page"

        edit: =>
            @subviews.topview.hide()
            @add_subview "topeditview", new AssignmentTopEditView(model: @model), ".assignment-top"
        
        editDone: =>
            @close_subview "topeditview"
            @subviews.topview.render()
            @subviews.topview.show()

    class AssignmentTopView extends baseviews.BaseView
        
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
            super
                    
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
            @model.save().success =>
                @parent.render()
                @parent.editDone()

        cancel: =>
            @mementoRestore()
            @parent.editDone()

            
    AssignmentRouterView: AssignmentRouterView
    AssignmentListView: AssignmentListView
    AssignmentView: AssignmentView
    AssignmentTopView: AssignmentTopView
    AssignmentTopEditView: AssignmentTopEditView
    
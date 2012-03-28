define ["cs!base/views", "cs!./models", "cs!page/views", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, pageviews, templates, styles) ->

    class AssignmentRouterView extends baseviews.RouterView

        routes: =>
            "": => new AssignmentListView collection: @collection
            ":assignment_id/": (assignment_id) => new AssignmentView model: @collection.get(assignment_id)

    class AssignmentListView extends baseviews.BaseView

        render: =>
            @$el.html templates.assignment_list @context()
            
    class AssignmentView extends baseviews.BaseView

        events:
            "click .assignment-top .edit-button": "edit"

        render: =>
            @$el.html templates.assignment @context()
            @add_subview "topview", new AssignmentTopView model: @model, ".assignment-top"
            @add_subview "topeditview", new AssignmentTopEditView model: @model, visible: false, ".assignment-top"
            @add_subview "pageview", new pageviews.PageRouterView model: @model.get("page"), ".assignment-page"

        edit: =>
            @subviews.topview.hide()
            @subviews.topeditview.show()
        
        editDone: =>
            @subviews.topeditview.hide()
            @subviews.topview.show()

    class AssignmentTopView extends baseviews.BaseView
        
        render: =>
            @$el.html templates.assignment_top @context()
            Backbone.ModelBinding.bind @
            

    AssignmentRouterView: AssignmentRouterView
    AssignmentListView: AssignmentListView
    AssignmentView: AssignmentView
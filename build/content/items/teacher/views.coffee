define ["cs!../views", "cs!base/views", "cs!../../models", "hb!./templates.handlebars", "less!./styles"], \
        (itemviews, baseviews, contentmodels, templates, styles) ->

    class TeacherItemEditView extends itemviews.ItemEditInlineView # or ItemEditPopupView
        
        render: =>
            @$el.html templates.item_teacher_edit @context()

    class TeacherItemView extends itemviews.ItemView

        EditView: TeacherItemEditView

        render: =>
            @$el.html templates.item_teacher @context()
            @updateWidth()
    
    title: "Instructors"
    description: "Create a list of course instructors, with contact info"
    ItemView: TeacherItemView
    ItemEditView: TeacherItemEditView
    
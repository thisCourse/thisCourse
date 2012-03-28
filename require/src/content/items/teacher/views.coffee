define ["cs!../views", "cs!base/views", "cs!../../models", "hb!./templates.handlebars", "less!./styles"], \
        (itemviews, baseviews, contentmodels, templates, styles) ->

    class TeacherItemView extends itemviews.ItemView

        render: =>
            @$el.html templates.item_teacher @context()
            @updateWidth()            

    class TeacherItemEditView extends itemviews.ItemEditInlineView # or ItemEditPopupView
        
        render: =>
            @$el.html templates.item_teacher_edit @context()

    
    title: "Instructors"
    description: "Create a list of course instructors, with contact info"
    ItemView: TeacherItemView
    ItemEditView: TeacherItemEditView
    
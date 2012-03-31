define ["cs!base/views", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, templates, styles) ->

    class DialogView extends baseviews.BaseView

        render: =>
            
    # TODO: turn all of the following into subclasses of DialogView
    
    dialog_from_template = (template_name, data, options) ->
        show_dialog Handlebars.templates[template_name](data), options

    show_dialog = (html, options) ->
        $("<div>" + html + "</div>").dialog _.extend(
            resizable: false
            modal: true
            dialogClass: "alert"
        , options)

    delete_confirmation = (model, type, delete_callback, options) ->
        dialog_from_template "delete_dialog", 
            title: model.get("title")
            type: type
        , _.extend(
            buttons:
                delete:
                    html: "Yes, delete!"
                    class: "btn danger"
                    click: ->
                        delete_callback()
                        $(this).dialog "close"
                cancel:
                    html: "Cancel"
                    class: "btn"
                    click: ->
                        $(this).dialog "close"

            closeOnEscape: true
        , options)

    dialog_request_response = (request, callback, confirm_button, cancel_button) ->
        confirm_button = "Confirm"    unless confirm_button
        cancel_button = "Cancel"    unless cancel_button
        rand_id = Math.random().toString().slice(2)
        dialog = show_dialog "<input id='" + rand_id + "' />",
            title: request
            buttons:
                save:
                    html: confirm_button
                    class: "btn success dialog-save-button"
                    click: ->
                        if $("#" + rand_id).val()
                            callback $("#" + rand_id).val()
                            $("#" + rand_id).val ""
                        $(this).dialog "close"

                cancel:
                    html: cancel_button
                    class: "btn"
                    click: ->
                        $(this).dialog "close"
        
        dialog.keypress (ev) ->
            if ev.which is 13
                $(".dialog-save-button").click()
                false


    DialogView: DialogView
    dialog_from_template: dialog_from_template
    show_dialog: show_dialog
    delete_confirmation: delete_confirmation
    dialog_request_response: dialog_request_response
    
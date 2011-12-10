function dialog_from_template(template_name, data, options) {
    show_dialog(Handlebars.templates[template_name](data), options)
}

function show_dialog(html, options) {
    return $("<div>" + html + "</div>").dialog(_.extend({
        resizable: false,
        modal: true,
        dialogClass: 'alert'
    }, options))
}

function delete_section_confirmation(model, delete_callback, options) {
    dialog_from_template("dialog-section-delete", model.attributes, _.extend({ 
        buttons: {
            "delete": {
                html: "Yes, delete!",
                "class": "btn danger",
                click: function() {
                    delete_callback()
                    $(this).dialog("close")
                }
            },
            "cancel": {
                html: "Cancel",
                "class": "btn",
                click: function() {
                    $(this).dialog("close")
                }
            }
        },
        closeOnEscape: true
    }, options))
}

function dialog_request_response(request, callback) {
    var rand_id = Math.random().toString().slice(2)
    var dialog = show_dialog("<input id='" + rand_id + "' />", {
        title: request, 
        buttons: {
            "save": {
                html: "Save",
                "class": "btn success dialog-save-button",
                click: function() {
                    callback($("#" + rand_id).val())
                    $(this).dialog("close")
                }
            },
            "cancel": {
                html: "Cancel",
                "class": "btn",
                click: function() {
                    $(this).dialog("close")
                }
            }
        }
    })
    dialog.keypress(function(ev) {
    	if (ev.which==13) {
    		$(".dialog-save-button").click()
    		return false
    	}
    })
}
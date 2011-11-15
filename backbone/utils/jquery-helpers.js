function dialog_from_template(template_name, data, options) {
    var rendered = Handlebars.templates[template_name](data)
    $("<div>" + rendered + "</div>").dialog(_.extend({
        resizable: false,
        modal: true,
        dialogClass: 'alert'
    }, options))
}

function delete_section_confirmation(model, delete_callback, options) {
        dialog_from_template("dialog-section-delete", model.attributes, _.extend({ 
            buttons: {
                "Yes, delete!": function() {
                    delete_callback()
                    $(this).dialog("close")
                },
                Cancel: function() {
                    $(this).dialog("close")
                }
            }
        }, options))
}
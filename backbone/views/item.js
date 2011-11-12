ItemView = Backbone.View.extend({
    tagName: "span",
    className: "item",
    template: "item",
    render: function() {
        this.renderTemplate()
        var self = this
        _.each(_.keys(this.model.attributes), function(attr) {
            if (attr!="title" && attr!="_id" && attr!="parent" && attr!="width")
                self.$('.attributes').append("<div class='attr_" + attr + "'><b>" + attr + ":</b> " + self.model.get(attr) + "</div>")
        })
        this.updateWidth()
        return this
    },
    events: {
        "click .edit-button": "edit",
        "mouseover .item-inner": "showActionButtons",
        "mouseout .item-inner": "hideActionButtons"
    },
    initialize: function() {
        this.el = $(this.el)
        this.el.attr('id', this.model.id)
        this.model.bind('change', this.render, this)
        this.render()
    },
    showActionButtons: function() {
        if (this.model.editing) return
        this.$(".item-button").show()
    },
    hideActionButtons: function() {
        this.$(".item-button").hide()
    },
    edit: function() {
        this.model.editing = true
        var editView = new ItemEditView({model: this.model, parent: this}).render()
        $("body").append(editView.el)
        this.hideActionButtons()
    }    
})

ItemEditView = Backbone.View.extend({
    tagName: "div",
    className: "item-edit item span5",
    template: "item-edit",
    render: function() {
        this.renderTemplate()
        return this
    },
    events: {
        "click .save": "save",
        "click .cancel": "cancel",
        "change input": "change",
        "keyup input": "change"
    },
    initialize: function() {
        this.el = $(this.el)
        this.memento = new Backbone.Memento(this.model)
        this.memento.store()
        this.render()
        this.reposition(0)
        Dispatcher.bind("resized", this.reposition, this)
    },
    reposition: function(duration) {
        if (duration===undefined) duration = 0
        var parent = this.options.parent
        var pos = parent.el.offset()
        var top = pos.top + parent.el.height()
        var left = pos.left
        //this.el.attr('left', left).attr('top', top)
        this.el.animate({left: left, top: top}, duration)
    },
    save: function() {
        this.$('.status').text("Saving...")
        var self = this
        this.model.save({}, {
            success: function() {
                self.$('.status').text("Saved!")
                self.el.fadeOut(500, function() { $(self).remove() })
                self.model.editing = false
            },
            error: function(model, err) {
                var msg = "An unknown error occurred while saving. Please try again."
                switch(err.status) {
                    case 0:
                        msg = "Unable to connect; please check internet connectivity and then try again."
                        break
                    case 404:
                        msg = "The object could not be found on the server; it may have been deleted."
                        break
                }
                self.$('.errors').text(msg)
                self.$('.status').text("")
            }
        })
    },
    cancel: function() {
        this.memento.restore()
        this.el.remove()
        this.model.editing = false
    },    
    change: function() {
        var new_vals = {}
        this.$("input[type=text]").each(function(index, input) {
            new_vals[$(input).attr("class")] = $(input).val() 
        })
        this.model.set(new_vals)
        this.reposition()
    }
})

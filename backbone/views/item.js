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
        "dblclick .itemtitle": "edit"
    },
    initialize: function() {
        this.el = $(this.el)
        this.el.attr('id', this.model.id)
        this.model.bind('change', this.render, this)
        this.render()
    },
    edit: function() {
        var editView = new ItemEditView({model: this.model, parent: this}).render()
        $("body").append(editView.el)
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
        var pos = parent.el.position()
        var top = pos.top + parent.el.height() + 8
        var left = pos.left + 10
        this.el.animate({left: left, top: top}, duration)
    },
    save: function() {
        var self = this
        this.model.save({}, {
            success: function() {
                self.el.fadeOut(300, function() { $(self).remove() })
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
                this.$('.errors').text(msg)
            }
        })
    },
    cancel: function() {
        this.memento.restore()
        this.el.remove()
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

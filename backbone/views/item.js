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
        this.type = this.options.type || "default"
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
        this.editView = new ItemEditViews[this.type]({model: this.model, parent: this}).render()
        $("body").append(this.editView.el)
        this.hideActionButtons()
    },
    close: function() {
        this.remove()
        this.unbind()
        this.model.unbind('change', this.render)
    }
})

ItemEditView = Backbone.View.extend({
    tagName: "div",
    className: "item-edit item span5",
    template: "item-edit",
    render: function() {
        this.renderTemplate()
        Backbone.ModelBinding.bind(this)
        this.focusFirstInput()
        return this
    },
    events: {
        "click .save": "save",
        "click .cancel": "cancel",
        "change input": "change",
        "keyup input": "keyup"
    },
    initialize: function() {
        this.el = $(this.el)
        this.memento = new Backbone.Memento(this.model)
        this.memento.store()
        this.render()
        this.reposition()
        this.scrollToShow()
        Dispatcher.bind("resized", this.reposition, this)
    },
    focusFirstInput: function() {
        var self = this
        setTimeout(function() { self.$("input:first").focus() }, 100)
    },
    reposition: function(duration) {
        if (duration===undefined) duration = 0
        var parent = this.options.parent
        var pos = parent.el.offset()
        var top = pos.top + parent.el.height()
        var left = pos.left
        this.el.animate({left: left, top: top}, duration)
    },
    scrollToShow: function() {
        var self = this
        setTimeout(function() {
            if ($(window).height() + $("html").scrollTop() < $(self.el).offset().top + $(self.el).height())
                $("html").animate({scrollTop: $(self.el).offset().top + $(self.el).height() - $(window).height()}, 1000)
        }, 100)
    },
    save: function() {
        var self = this
        self.$("input").blur()
        self.$('.save.btn').button('loading')
        this.model.save({}, {
            success: function() {
                self.$('.save.btn').button('complete')
                self.el.fadeOut(500, function() { self.close() })
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
                self.$('.save.btn').button('complete')
            }
        })
    },
    cancel: function() {
        this.memento.restore()
        this.close()
    },
    keyup: function(ev) {
        //$(ev.target).change()
        if (ev.which==13) this.save()
        if (ev.which==27) this.cancel()
    },
    change: function(ev) {
        this.reposition()
    },
    close: function() {
        this.model.editing = false
        this.remove()
        this.unbind()
        Dispatcher.unbind("resized", this.reposition, this)
        Backbone.ModelBinding.unbind(this)
    }
})

ItemViews = {"default": ItemView}
ItemEditViews = {"default": ItemEditView}

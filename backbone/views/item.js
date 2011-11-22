ItemView = Backbone.View.extend({
    tagName: "span",
    className: "item",
    render: function() {
        this.renderTemplate({target: ".item-inner"})
        var self = this
        _.each(_.keys(this.model.attributes), function(attr) {
            if (attr!="title" && attr!="_id" && attr!="parent" && attr!="width" && self.model.get(attr))
                self.$('.attributes').append("<div class='attr_" + attr + "'><b>" + attr + ":</b> " + self.model.get(attr) + "</div>")
        })
        this.updateWidth()
        return this
    },
    events: function() {
        return {
            "click .edit-button": "edit",
            "click .delete-button": "delete",
            "mouseenter .item-inner": "showActionButtons",
            "mouseleave .item-inner": "hideActionButtons"
        }
    },
    initialize: function() {
        this.el = $(this.el)
        this.type = this.type || this.options.type || ""
        if (this.type)
            this.template = "item-" + this.type
        else
            this.template = "item"
        this.el.addClass(this.template)
        this.model.bind('change', this.change, this)
        this.renderTemplate({template: "item-container"})
        this.change()
    },
    showActionButtons: function() {
        if (this.model.editing) return
        this.$(".item-button").not(".drag-button").fadeIn(50)
        this.$(".item-button.drag-button").fadeIn(200)
    },
    hideActionButtons: function() {
        this.$(".item-button").fadeOut(50)
    },
    edit: function() {
        this.model.editing = true
        this.editView = new ItemEditViews[this.type]({model: this.model, parent: this}).render()
        this.hideActionButtons()
    },
    "delete": function() {
        this.model.destroy()
    },
    close: function() {
        this.remove()
        this.unbind()
        this.model.unbind('change', this.render)
    },
    change: function() {
        this.render()
        this.el.attr('id', this.model.id || this.model.cid)
    }
})

ItemEditView = Backbone.View.extend({
    render: function() {
        Backbone.ModelBinding.bind(this)
        //this.focusFirstInput()
        return this
    },
    events: function() {
        return {
            "click .save": "save",
            "click .cancel": "cancel",
            "change input": "change"
        }
    },
    initialize: function() {
        this.el = $(this.el)
        this.type = this.type || this.options.type || this.options.parent.type || ""
        if (this.type)
            this.template = "item-" + this.type + "-edit"
        else
            this.template = "item-edit"
        this.el.addClass(this.template)
        this.memento = new Backbone.Memento(this.model)
        this.memento.store()
        this.render()
    },
    focusFirstInput: function() {
        var self = this
        _.defer(function() { self.$("input:first").focus() })
    },
    save: function() {
        var self = this
        self.$("input").blur()
        self.$('.save.btn').button('loading')
        this.model.save({}, {
            success: function() {
                self.$('.save.btn').button('complete')
                self.saved()
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
    saved: function() {
        
    },
    cancel: function() {
        this.memento.restore()
        this.close()
        if (!this.model.id) this.model.destroy()
    },
    change: function(ev) {
        
    },
    close: function() {
        this.model.editing = false
        this.remove()
        this.unbind()
        Backbone.ModelBinding.unbind(this)
        delete this.options.parent.editView
        this.options.parent.updateWidth()
    }
})

ItemEditPopupView = ItemEditView.extend({
    base: ItemEditView.prototype,
    className: "item-edit item-edit-popup",
    render: function() {
        this.renderTemplate()
        this.base.render.apply(this, arguments)
        return this
    },
    events: function() {
        return _.extend({
            "focus input": "scrollToShow",
            "keyup input": "keyup",
            "mouseenter": "bringToTop"
        }, this.base.events())
    },
    initialize: function() {
        this.base.initialize.apply(this, arguments)
        this.reposition()
        this.scrollToShow()
        Dispatcher.bind("resized", this.reposition, this)
        $("body").append(this.el)
    },
    close: function() {
        this.base.close.apply(this, arguments)
        Dispatcher.unbind("resized", this.reposition, this)
    },
    change: function() {
        this.base.change.apply(this, arguments)
        this.reposition()
    },
    keyup: function(ev) {
        $(ev.target).change()
        if (ev.which==13) this.save()
        if (ev.which==27) this.cancel()
    },
    bringToTop: function() {
        $(".item-edit-popup").css("z-index", 50)
        this.el.css("z-index", 100)
    },
    saved: function() {
        var self = this
        self.el.animate({opacity: 0}, 300, function() { self.close() })
    },
    reposition: function(duration) {
        var self = this
        if (duration===undefined) duration = 0
        var parent = this.options.parent
        var pos = parent.el.offset()
        var top = pos.top + parent.el.height()
        var left = pos.left
        this.el.stop().animate({left: left, top: top}, duration, "swing", function () {
            if (self.$("input:focus").length > 0)
                self.scrollToShow()
        })
    },
    scrollToShow: function() {
        var self = this
        $("html, body").stop()
        _.defer(function() {
            var target_scroll_offset = $("body").scrollTop()
            if ($(window).height() + $("body").scrollTop() < $(self.el).offset().top + $(self.el).height() + 30)
                target_scroll_offset = $(self.el).offset().top + $(self.el).height() - $(window).height() + 30
            if ($("body").scrollTop() > $(self.el).offset().top)
                target_scroll_offset = $(self.el).offset().top
            if (target_scroll_offset > 0 && target_scroll_offset != $("body").scrollTop())
                $("html, body").stop().animate({scrollTop: target_scroll_offset}, 400)
        })
    }
})

ItemEditInlineView = ItemEditView.extend({
    base: ItemEditView.prototype,
    className: "item-edit item-edit-inline",
    minwidth: 6,
    render: function() {
        this.renderTemplate()
        this.base.render.apply(this, arguments)
        var self = this
        _.defer(function() { self.options.parent.updateWidth() }, 200)
        return this
    },
    events: function() {
        return _.extend({
            "keyup input": "keyup"
        }, this.base.events())
    },
    keyup: function(ev) {
        if (ev.which==13) this.save()
        if (ev.which==27) this.cancel()
    },
    initialize: function() {
        this.base.initialize.apply(this, arguments)
        this.options.parent.$(".item-inner").hide()
        this.options.parent.el.append(this.el)
    },
    saved: function() {
        this.close()
    },
    close: function() {
        this.base.close.apply(this, arguments)
        this.options.parent.$(".item-inner").show()
    }    
})

ItemViews = {"": ItemView}
ItemEditViews = {"": ItemEditPopupView}


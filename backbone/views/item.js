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
        var editView = new ItemEditView({model: this.model}).render()
        editView.el.insertAfter(this.el)
        //this.model.save({"title": this.model.get("title") + " :)"})
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
    },
    save: function() {
        this.model.save()
        this.el.fadeOut(300, function() { $(this).remove() })
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
    }
})

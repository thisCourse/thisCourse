SectionView = Backbone.View.extend({
    tagName: "div",
    className: "section border2",
    template: "section",
    buttonFadeSpeed: 60,
    render: function() {
        this.renderTemplate()
        this.makeSortable()
        this.update()
        return this
    },
    events: {
        "mouseenter .section-inner": "showBottomActionButtons",
        "mouseleave .section-inner": "hideAllActionButtons",
        "mouseenter .sectiontitle": "showTopActionButtons",
        "mouseout .sectiontitle": "hideTopActionButtons",
        "mouseenter .items": "hideTopActionButtons",
        "click .section-button.add-button": "addNewItem",
        "click .section-button.delete-button": "delete"
    },
    showBottomActionButtons: function() {
        this.$(".section-button.add-button").fadeIn(this.buttonFadeSpeed)
    },
    hideBottomActionButtons: function() {
        this.$(".section-button.add-button").fadeOut(this.buttonFadeSpeed)
        //return false // to stop the propagation so that it won't trigger the parent's
    },
    showTopActionButtons: function() {
        this.$(".section-button.drag-button").fadeIn(this.buttonFadeSpeed)
        this.$(".section-button.delete-button").fadeIn(this.buttonFadeSpeed)
    },
    hideTopActionButtons: function() {
        this.$(".section-button.drag-button").fadeOut(this.buttonFadeSpeed)
        this.$(".section-button.delete-button").fadeOut(this.buttonFadeSpeed)
        //return false // to stop the propagation so that it won't trigger the parent's
    },
    hideAllActionButtons: function() {
        this.$(".section-button").fadeOut(this.buttonFadeSpeed)
        //return false // to stop the propagation so that it won't trigger the parent's
    },
    initialize: function() {
    	this.model.set({_editor: app.get("_editor")})
        this.itemViews = {}
        this.el = $(this.el)
        this.el.attr('id', this.model.id)
        this.model.bind("change", this.update, this)
        this.model.bind("update:items", this.updateItems, this)
        this.model.bind("add:items", this.addItems, this)
        this.model.bind("remove:items", this.removeItems, this)
        this.model.bind("change:width", this.updateWidth, this)
        this.updateWidth()
        this.render()
        for (var i=0; i < this.model.get('items').length; i++)
            this.addItems(this.model.get('items').at(i), this.collection)
    },
    makeSortable: function() {
        var self = this
        this.$('.items').sortable({
            update: function(event, ui) {
                // get the post-sort item order (as a list of id's) and save the new collection order 
                var new_order = self.$('.items').sortable("toArray")
                self.model.get('items').reorder(new_order)
                self.model.save()
            },
            opacity: 0.6,
            tolerance: "pointer",
            handle: ".drag-button"
        })
    },
    addNewItem: _.throttle(function() {
        this.model.get('items').add({})
    }, 500),
    edit: function() {
        alert('editing! ' + this.model.attributes)
    },
    "delete": function() {
        var self = this
        if (this.model.get("items").length)
            delete_confirmation(this.model, "section", function() { self.model.destroy() })
        else
            self.model.destroy()
    },
    updateItems: function(model, coll) {
        //alert('update items')
    },
    addItems: function(model, coll) {
        var type = model.get('type') || this.model.get('type') || ""
        var view = this.itemViews[model.cid] = new ItemViews[type]({model: model, type: type})
        this.$(".items").append(view.el)
        // if this is a new (unsaved) item, put it directly into edit mode
        if (!model.get("_id")) view.edit()
    },
    removeItems: function(model, coll) {
        if (!this.itemViews[model.cid].el) return
        $(this.itemViews[model.cid].el).fadeOut(300, function() { $(this).remove() })
        delete this.itemViews[model.cid]
    },
    update: function() {
        this.$('.sectiontitle').text(this.model.get("title"))
    }
})

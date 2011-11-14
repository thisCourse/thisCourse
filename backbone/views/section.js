SectionView = Backbone.View.extend({
    tagName: "div",
    className: "section border2",
    template: "section",
    render: function() {
        this.renderTemplate()
        this.makeSortable()
        this.update()
        return this
    },
    events: {
        //"click .sectiontitle": "edit",
        "mouseover .section-inner": "showActionButtons",
        "mouseout .section-inner": "hideActionButtons",
        "mouseover .items": "hideActionButtons"
    },
    showActionButtons: function() {
        this.$(".section-button").show()
    },
    hideActionButtons: function() {
        this.$(".section-button").hide()
        return false // to stop the propagation so that it won't trigger the parent's
    },
    initialize: function() {
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
    edit: function() {
        alert('editing! ' + this.model.attributes)
    },
    updateItems: function(model, coll) {
        //alert('update items')
    },
    addItems: function(model, coll) {
        var type = model.get('type') || this.model.get('type') || "default"
        var view = this.itemViews[model.cid] = new ItemViews[type]({model: model, type: type})
        this.$(".items").append(view.el)
    },
    removeItems: function(model, coll) {
        $(this.itemViews[model.cid].el).fadeOut(300, function() { $(this).remove() })
        delete this.itemViews[model.cid]
    },
    update: function() {
        this.$('.sectiontitle').text(this.model.get("title"))
    }
})
ContentView = Backbone.View.extend({
    tagName: "div",
    className: "content",
    template: "content",
    render: function() {
        this.renderTemplate()
        this.makeSortable()
        this.update()
        return this
    },
    initialize: function() {
        this.sectionViews = {}
        this.el = $(this.el)
        this.model.bind('change', this.update, this)
        this.model.bind("update:sections", this.updateSections, this)
        this.model.bind("add:sections", this.addSections, this)
        this.model.bind("remove:sections", this.removeSections, this)
        this.render()
    },
    updateSections: function(model, coll) {
        //alert('update sections')
    },
    addSections: function(model, coll) {
        this.sectionViews[model.cid] = new SectionView({model: model})
        this.$('.sections').append(this.sectionViews[model.cid].el)
    },
    removeSections: function(model, coll) {
        $(this.sectionViews[model.cid].el).fadeOut(300, function() { $(this).remove() })
        delete this.sectionViews[model.cid]
    },
    makeSortable: function() {
        var self = this
        this.$('.sections').sortable({
            update: function(event, ui) {
                // get the post-sort section order (as a list of id's) and save the new collection order 
                var new_order = self.$('.sections').sortable("toArray")
                self.model.get('sections').reorder(new_order)
                self.model.save()
            },
            opacity: 0.6,
            tolerance: "pointer"
        })
    },
    update: function() {
        this.$('.title').text(this.model.get("title"))
    }
})
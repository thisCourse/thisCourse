ContentView = Backbone.View.extend({
    tagName: "div",
    className: "content",
    render: function() {
        //console.log("content render")
        this.el.html("<h1 class='title'></h1><div class='sections'></div>")
        this.makeSortable()
        this.update()
        return this
    },
    initialize: function() {
        this.sectionViews = {}
        //console.log("binding add:sections")
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
        //console.log("addSections:", model)
        this.sectionViews[model.cid] = new SectionView({model: model})
        this.$('.sections').append(this.sectionViews[model.cid].el)
    },
    removeSections: function(model, coll) {
        //console.log("removeSections:", model)
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
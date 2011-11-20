PageView = Backbone.View.extend({
    tagName: "div",
    className: "page",
    template: "page",
    events: {
        //"mouseover .content-inner": "showActionButtons",
        //"mouseout .content-inner": "hideActionButtons",
        //"mouseenter .sections": "hideActionButtons",
        "click .content-button.add-button": "addNewSection"
    },
    showActionButtons: function() {
        this.$(".page-button").show()
    },
    hideActionButtons: function() {
        this.$(".page-button").hide()
        return false // to stop the propagation so that it won't trigger the parent's
    },
    render: function() {
        this.renderTemplate()
        this.makeSortable()
        this.update()
        return this
    },
    initialize: function() {
        this.contentViews = {}
        this.el = $(this.el)
        this.model.bind('change', this.update, this)
        this.model.bind("update:contents", this.updateContents, this)
        this.model.bind("add:contents", this.addContents, this)
        this.model.bind("remove:contents", this.removeContents, this)
        this.render()
    },
    addNewSection: function() {
        this.model.get('sections').create({type: this.$(".add-section-type").val()})
    },    
    updateContents: function(model, coll) {
        //alert('update sections')
    },
    addContents: function(model, coll) {
        this.contentViews[model.cid] = new ContentView({model: model})
        this.$('.contents').append(this.contentViews[model.cid].el)
    },
    removeContents: function(model, coll) {
        $(this.contentViews[model.cid].el).fadeOut(300, function() { $(this).remove() })
        delete this.contentViews[model.cid]
    },
    makeSortable: function() {
        var self = this
        this.$('.contents').sortable({
            update: function(event, ui) {
                // get the post-sort section order (as a list of id's) and save the new collection order 
                var new_order = self.$('.contents').sortable("toArray")
                self.model.get('contents').reorder(new_order)
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
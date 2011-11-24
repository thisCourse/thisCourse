ContentView = Backbone.View.extend({
    tagName: "div",
    className: "content",
    template: "content",
    events: {
        //"mouseover .content-inner": "showActionButtons",
        //"mouseout .content-inner": "hideActionButtons",
        //"mouseenter .sections": "hideActionButtons",
        "click .content-button.add-button": "addNewSection", 
    },
    showActionButtons: function() {
        this.$(".content-button").show()
    },
    hideActionButtons: function() {
        this.$(".content-button").hide()
        return false // to stop the propagation so that it won't trigger the parent's
    },
    render: function() {
        this.renderTemplate()
        this.makeSortable()
        this.update()
        this.makeEditable()
        return this
    },
    initialize: function() {
        this.sectionViews = {}
        this.el = $(this.el)
        this.model.bind('change', this.update, this)
        this.model.bind("update:sections", this.updateSections, this)
        this.model.bind("add:sections", this.addSections, this)
        this.model.bind("remove:sections", this.removeSections, this)
        this.model.bind('save', this.saved, this)
        this.render()
    },
    addNewSection: function() {
        var new_section = {type: this.$(".add-section-type").val()}
        if (this.model.get("width"))
            new_section.width = this.model.get("width") 
        this.model.get('sections').create(new_section)
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
    makeEditable: function() {
        var self = this
        this.$(".title").editable(function(new_value) {
            self.model.set({title: new_value}).save()
        }, {
            submit: "Save",
            cancel: "Cancel",
            event: "dblclick",
            cssclass: "jeditable",
            tooltip: "Double click to edit",
            onedit: function() {
                _.defer(function() { self.$(".jeditable button").addClass("btn").css("margin-left", 5) })
            }
        })
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
            tolerance: "pointer",
            handle: ".drag-button"
        })
    },
    update: function() {
        this.$('.title').text(this.model.get("title"))
    },
    saved: function() {
        console.log("content saved")        
    }
})
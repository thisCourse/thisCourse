PageView = Backbone.View.extend({
    tagName: "div",
    className: "page",
    template: "page",
    events: {
        //"mouseover .content-inner": "showActionButtons",
        //"mouseout .content-inner": "hideActionButtons",
        //"mouseenter .sections": "hideActionButtons",
        "click .page-button.add-button": "addNewContent"
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
        this.pageNavRowViews = {}
        this.el = $(this.el)
        this.model.bind('change', this.update, this)
        this.model.bind("update:contents", this.updateContents, this)
        this.model.bind("add:contents", this.addContents, this)
        this.model.bind("remove:contents", this.removeContents, this)
        this.render()
    },
    addNewContent: function() {
        var self = this
        var newContent = new Content({title: "dummy", width: 8})
        this.model.get('contents').add(newContent)
        newContent.save(function() { self.model.save() })
    },    
    updateContents: function(model, coll) {
        //alert('update contents')
    },
    addContents: function(model, coll) {
        this.pageNavRowViews[model.cid] = new PageNavRowView({model: model, parent: this})
        this.$('.nav-links').append(this.pageNavRowViews[model.cid].el)
    },
    removeContents: function(model, coll) {
        $(this.pageNavRowViews[model.cid].el).fadeOut(300, function() { $(this).remove() })
        delete this.pageNavRowViews[model.cid]
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


PageNavRowView = Backbone.View.extend({
    tagName: "li",
    template: "page-nav-row",
    events: {
        "click a": "showContent"
    },
    render: function() {
        this.renderTemplate()
        return this
    },
    initialize: function() {
        this.contentViews = {}
        this.el = $(this.el)
        this.model.bind('change:title', this.render, this)
        this.model.bind('change:_id', this.saveParent, this)
        this.model.bind('change:title', this.titleChange, this)
        this.model.bind('save', this.saveParent, this)
        this.render()
    },
    showContent: function() {
        if (!this.contentView) {
            console.log("fetching content block to show")
            this.model.fetch()
            this.contentView = new ContentView({model: this.model})
            this.options.parent.$(".contents").append(this.contentView.render().el)
        }
        console.log("showing content block")
        this.contentView.el.show().siblings().hide()
    },
    titleChange: function() {
        // keep track of the title having changed so we know to save the parent  
        this.titleChanged = true
    },
    saveParent: function() {
        // save the parent too (so it stores the title), but only if the title has changed 
        if (this.titleChanged) {
            alert('saving parent')
            this.model.get('parent').save()
            delete this.titleChanged
        }
    }
})


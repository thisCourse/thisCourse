PageView = Backbone.View.extend({
    tagName: "div",
    className: "page",
    template: "page",
    events: {
        //"mouseover .content-inner": "showActionButtons",
        //"mouseout .content-inner": "hideActionButtons",
        //"mouseenter .sections": "hideActionButtons",
        //"click .page-button.add-button": "addNewContent"
    },
    showActionButtons: function() {
        this.$(".page-button").show()
    },
    hideActionButtons: function() {
        this.$(".page-button").hide()
        return false // to stop the propagation so that it won't trigger the parent's
    },
    render: function() {
        var self = this
        this.renderTemplate()
        if (this.model.get("_editor"))
        	this.makeSortable()
        this.update()
        this.$(".page-button.add-button").click(function() { self.addNewContent() })
        return this
    },
    button: function() {
        alert("button")
    },
    initialize: function() {
        this.pageNavRowViews = {}
        this.el = $(this.el)
        this.model.bind('change', this.update, this)
        this.model.bind("update:contents", this.updateContents, this)
        this.model.bind("add:contents", this.addContents, this)
        this.model.bind("remove:contents", this.removeContents, this)
        this.model.bind('change:_editor', this.render, this)
        this.render()
    },
    addNewContent: function() {
        var self = this
        dialog_request_response("Please enter a title:", function(val) {
            var new_content = new Content({title: val, width: 12, _editor: true})
            self.model.get('contents').add(new_content)
            new_content.save().success(function() {
                self.pageNavRowViews[new_content.cid].showContent()
                self.model.save()
            }) 
        })
    },    
    updateContents: function(model, coll) {
        //alert('update contents')
    },
    addContents: function(model, coll) {
        this.pageNavRowViews[model.cid] = new PageNavRowView({model: model, parent: this, url: this.options.url + "/pages/"})
        this.$('.nav-links').append(this.pageNavRowViews[model.cid].el)
        if (!this.activeSubpage || this.activeSubpage==model.id)
            this.pageNavRowViews[model.cid].showContent()
    },
    removeContents: function(model, coll) {
        if (!this.pageNavRowViews[model.cid]) return
        $(this.pageNavRowViews[model.cid].el).remove() //fadeOut(300, function() { $(this).remove() })
        delete this.pageNavRowViews[model.cid]
    },
    makeSortable: function() {
        var self = this
        this.$('.navigation ul').sortable({
            update: function(event, ui) {
                // get the post-sort section order (as a list of id's) and save the new collection order 
                var new_order = self.$('.navigation ul').sortable("toArray")
                self.model.get('contents').reorder(new_order)
                self.model.save()
            },
            opacity: 0.6,
            tolerance: "pointer",
            distance: 5
        })
    },
    update: function() {
        
    },
    showSubpage: function(page) {
        this.activeSubpage = page
        for (var cid in this.pageNavRowViews) {
            if (this.pageNavRowViews[cid].model.id===page)
                this.pageNavRowViews[cid].showContent()
        }
    }
})


PageNavRowView = Backbone.View.extend({
    tagName: "li",
    template: "page-nav-row",
    events: {
        "click a": "clicked"
    },
    render: function() {
        this.renderTemplate({data: {content: this.model.attributes, url: this.options.url}})
        return this
    },
    initialize: function() {
        this.contentViews = {}
        this.el = $(this.el)
        this.model.bind('change:title', this.render, this)
        this.model.bind('change:_id', this.changeId, this)
        this.model.bind('change:title', this.titleChange, this)
        this.model.bind('save', this.saved, this)
        this.el.attr('id', this.model.id)
        this.render()
    },
    clicked: function() {
        app.set({url: this.options.url + this.model.id})
        return false
    },
    showContent: function() {
        var self = this
        if (!this.contentView) {
            if (this.model.id)
                this.model.fetch()
            this.contentView = new ContentView({model: this.model})
            this.options.parent.$(".contents").append(this.contentView.render().el)
        }
        _.each(this.options.parent.pageNavRowViews, function(view) {
            // set each nav list item to active (bold) or not, appropriately
            view.el.toggleClass("active", view===self)
            if (view.contentView) // hide or show each content block appropriately
                view.contentView.el.toggle(view===self)
        })
        this.options.parent.activeSubpage = this.model.id
        return false
    },
    titleChange: function() {
        // keep track of the title having changed so we know to save the parent  
        this.titleChanged = true
    },
    saved: function() {
        // save the parent too (so it stores the title), but only if the title has changed
        if (this.titleChanged) {
            this.saveParent()
            delete this.titleChanged
        }        
    },
    changeId: function () {
        this.saveParent()
        this.el.attr('id', this.model.id)
    },
    saveParent: function() {
        //alert('saving parent')
        this.model.get('page').save()
    },
    close: function() {
        this.model.unbind('change', this.update, this)
        this.model.unbind("update:contents", this.updateContents, this)
        this.model.unbind("add:contents", this.addContents, this)
        this.model.unbind("remove:contents", this.removeContents, this)
    }
})


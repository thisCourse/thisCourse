AssignmentView = Backbone.View.extend({
    tagName: "div",
    className: "assignment",
    template: "assignment",
    render: function() {
        this.renderTemplate()
        this.renderTopView()
        this.renderPageView()
        return this
    },
    renderTopView: function() {
        this.$(".assignment-top").html("").append(this.topView.render().el)
    },
    renderPageView: function() {
        this.$(".assignment-page").html("").append(this.pageView.render().el)
    },
    events: {
        "click .assignment-top .edit-button": "edit"
    },
    initialize: function() {
        this.el = $(this.el)
        this.model.bind('change:page', this.pageChanged, this)
        this.model.bind('change:_id', this.changeId, this)
        this.model.bind('change:title', this.titleChange, this)
        this.model.bind('save', this.saved, this)
        this.topView = new AssignmentTopView({model: this.model})
        this.pageView = new PageView({model: this.model.get("page")})
        this.model.get("page").fetch()
        this.render()
    },
    pageChanged: function() {
        console.log("page changed")
        
    },
    close: function() {
        this.el.remove()
    },
    titleChange: function() {
        // keep track of the title having changed so we know to save the parent  
        this.titleChanged = true
    },
    edit: function(){
        this.topEditView = new AssignmentTopEditView({model: this.model, parent: this})
        this.$(".assignment-top").html("").append(this.topEditView.render().el)
    },
    saved: function() {
        // save the parent too (so it stores the title), but only if the title has changed
        console.log("assignment saved")
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
    }
})

AssignmentTopView = Backbone.View.extend({
    tagName: "div",
    className: "assignment-top",
    template: "assignment-top",
    events: {
        //"mouseover .content-inner": "showActionButtons",
        //"mouseout .content-inner": "hideActionButtons",
        //"mouseenter .sections": "hideActionButtons",
    },
    render: function() {
        this.renderTemplate()
        //this.pageView.render().el.after(this.el)
        return this
    },
    initialize: function() {
        this.el = $(this.el)
        this.model.bind('change:title', this.render, this)
        this.model.bind('change:description', this.render, this)
        //this.model.fetch()
        this.render()
    },
    pageChanged: function() {
        console.log("page changed")
        this.pageView = new PageView({model: this.model.get("page")})
    },
    close: function() {
        this.el.remove()
    },
    titleChange: function() {
        // keep track of the title having changed so we know to save the parent  
        this.titleChanged = true
    },
    changeId: function () {
        this.saveParent()
        this.el.attr('id', this.model.id)
    }
})

AssignmentListView = Backbone.View.extend({
    tagName: "div",
    template: "assignment-list",
    events: {
        "click a": "showAssignment",
        "click .add-button": "addNewAssignment"
    },
    render: function() {
        this.renderTemplate()
        return this
    },
    initialize: function() {
        this.el = $(this.el)
        this.collection.bind("change", this.render, this)
        this.render()
    },
    showAssignment: function(ev) {
        var self = this
        var model_id = $(ev.target).attr("href")
        //this.collection.get(model_id).fetch()
        app.set({url: "assignments/" + model_id})
        return false
    },
    addNewAssignment: function() {
        var self = this
        dialog_request_response("Please enter a title:", function(title) {
            var page = new Page
            page.save().success(function() {
                var new_assignment = new Assignment({title: title, page: page})
                app.course.get('assignments').add(new_assignment)
                new_assignment.save().success(function() { app.course.save() })
            })
        })
    },
    close: function() {
        this.el.remove()
        this.collection.unbind("add", this.render, this)
    }
})

AssignmentTopEditView = Backbone.View.extend({
    tagName: "div",
    className: "assignment-edit",
    template: "assignment-edit",
    render: function() {
    	var self = this
        this.renderTemplate()
        Backbone.ModelBinding.bind(this)
        this.enablePlaceholders()
        var due = this.model.getDate("due")
        if (due)
        	$(".due-date", this.el).val((due.getMonth()+1) + "/" + due.getDate() + "/" + due.getFullYear())
        $(".due-date", this.el).datepicker({
        	onSelect: function(date) {
        		$(".due-date", this.el).val(date) // TODO: why does scoping this make it not work?
        	}
        })
        return this
    },
    events: {
        "click button.save": "save",
        "click button.cancel": "cancel"
    },
    base: ItemEditInlineView,
    save: function() {
    	var due = $(".due-date").val() || undefined // TODO: why does scoping this make it not work?
    	if (due) due = new Date(due)
    	this.model.set({due: due})
        ItemEditInlineView.prototype.save.apply(this)
    },
    saved: function() {
        ItemEditInlineView.prototype.saved.apply(this)
        this.model.get("course").save()
    },
    cancel: ItemEditInlineView.prototype.cancel,
    restore: ItemEditInlineView.prototype.cancel,
    close: function() {
        this.options.parent.renderTopView()
        Backbone.ModelBinding.unbind(this)
    },
    initialize: function() {
        this.el = $(this.el)
        this.memento = new Backbone.Memento(this.model)
        this.memento.store()
        this.render()
    }
})
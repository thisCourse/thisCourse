LectureView = Backbone.View.extend({
    tagName: "div",
    className: "lecture",
    template: "lecture",
    render: function() {
        this.renderTemplate()
        this.renderTopView()
        this.renderPageView()
        return this
    },
    renderTopView: function() {
        this.$(".lecture-top").html("").append(this.topView.render().el)
    },
    renderPageView: function() {
        this.$(".lecture-page").html("").append(this.pageView.render().el)
    },
    events: {
        "click .lecture-top .edit-button": "edit"
    },
    initialize: function() {
        this.el = $(this.el)
        this.model.bind('change:page', this.pageChanged, this)
        this.model.bind('change:_id', this.changeId, this)
        this.model.bind('change:title', this.titleChange, this)
        this.model.bind('save', this.saved, this)
        this.topView = new LectureTopView({model: this.model})
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
        this.topEditView = new LectureTopEditView({model: this.model, parent: this})
        this.$(".lecture-top").html("").append(this.topEditView.render().el)
    },
    saved: function() {
        // save the parent too (so it stores the title), but only if the title has changed
        console.log("lecture saved")
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

LectureTopView = Backbone.View.extend({
    tagName: "div",
    className: "lecture-top",
    template: "lecture-top",
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

LectureListView = Backbone.View.extend({
    tagName: "div",
    template: "lecture-list",
    events: {
        "click a": "showLecture",
        "click .add-button": "addNewLecture"
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
    showLecture: function(ev) {
        var self = this
        var model_id = $(ev.target).attr("href")
        //this.collection.get(model_id).fetch()
        app.set({url: "lectures/" + model_id})
        return false
    },
    addNewLecture: function() {
        var self = this
        dialog_request_response("Please enter a title:", function(title) {
            var page = new Page
            page.save().success(function() {
                var new_lecture = new Lecture({title: title, page: page})
                app.course.get('lectures').add(new_lecture)
                new_lecture.save().success(function() { app.course.save() })
            })
        })
    },
    close: function() {
        this.el.remove()
        this.collection.unbind("add", this.render, this)
    }
})

LectureTopEditView = Backbone.View.extend({
    tagName: "div",
    className: "lecture-edit",
    template: "lecture-edit",
    render: function() {
        this.renderTemplate()
        Backbone.ModelBinding.bind(this)
        this.enablePlaceholders()
        return this
    },
    events: {
        "click button.save": "save",
        "click button.cancel": "cancel"
    },
    base: ItemEditInlineView,
    save: ItemEditInlineView.prototype.save,
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
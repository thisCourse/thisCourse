LectureView = Backbone.View.extend({
    tagName: "div",
    className: "lecture",
    template: "lecture",
    events: {
        //"mouseover .content-inner": "showActionButtons",
        //"mouseout .content-inner": "hideActionButtons",
        //"mouseenter .sections": "hideActionButtons",
    },
    render: function() {
        this.renderTemplate()
        this.el.append(this.pageView.render().el)
        //this.pageView.render().el.after(this.el)
        return this
    },
    initialize: function() {
        this.pageNavRowViews = {}
        this.el = $(this.el)
        this.model.bind('change:page', this.pageChanged, this)
        this.model.bind('change:title', this.render, this)
        this.model.bind('change:_id', this.changeId, this)
        this.model.bind('change:title', this.titleChange, this)
        this.model.bind('save', this.saved, this)
        this.pageChanged()
        this.model.get("page").fetch()
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


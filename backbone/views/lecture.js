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
    close: function() {
        this.el.remove()
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
        this.collection.bind("add", this.render, this)
        this.render()
    },
    showLecture: function(ev) {
        var self = this
        ev.preventDefault()
        app.set({url: "lectures/" + $(ev.target).attr("href")})
        return false
    },
    addNewLecture: function() {
        var self = this
        dialog_request_response("Please enter a title:", function(val) {
            var new_lecture = new Lecture({title: val})
            app.course.get('lectures').create(new_lecture)
            new_lecture.save().success(function() { app.course.save() })
        })
    },
    close: function() {
        this.el.remove()
    }
})


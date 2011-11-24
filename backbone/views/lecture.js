LectureView = Backbone.View.extend({
    tagName: "div",
    className: "lecture",
    template: "lecture",
    events: {
        //"mouseover .content-inner": "showActionButtons",
        //"mouseout .content-inner": "hideActionButtons",
        //"mouseenter .sections": "hideActionButtons",
        "click .page-button.add-button": "addNewContent"
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
    close: function() {
        this.el.remove()
    }
})


LectureListView = Backbone.View.extend({
    tagName: "div",
    template: "lecture-list",
    events: {
        "click a": "showLecture"
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
        
        return false
    },
    close: function() {
        this.el.remove()
    }
})


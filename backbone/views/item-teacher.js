ItemViews["teacher"] = ItemView.extend({
    base: ItemView.prototype,
    template: "item-teacher",
    render: function() {
        this.renderTemplate()
        this.updateWidth()
        return this
    },
    events: function() {
        return _.extend({
            //"dblclick": "dblclick"
        }, this.base.events)
    },
    initialize: function() {
        this.base.initialize.apply(this, arguments)
    },
    close: function() {
        this.base.close.apply(this, arguments)
    }
})

ItemEditViews["teacher"] = ItemEditView.extend({
    base: ItemEditView.prototype,
    template: "item-teacher-edit",
    render: function() {
        this.base.render.apply(this, arguments)
        return this
    },
    events: function() {
        return _.extend({
            //"dblclick": "dblclick"
        }, this.base.events)
    },
    initialize: function() {
        this.base.initialize.apply(this, arguments)
    },
    close: function() {
        this.base.close.apply(this, arguments)
    }
})

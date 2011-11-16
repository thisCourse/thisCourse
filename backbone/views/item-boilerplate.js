var type = "ITEMTYPE"

ItemViews[type] = ItemView.extend({
    base: ItemView.prototype,
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

var EditorView = ItemEditInlineView

ItemEditViews[type] = EditorView.extend({
    base: EditorView.prototype,
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

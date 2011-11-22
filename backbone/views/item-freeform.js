(function() {

    var type = "freeform"
    
    ItemViews[type] = ItemView.extend({
        base: ItemView.prototype,
        render: function() {
            var self = this
            this.base.render.apply(this, arguments)
            return this
        },
        events: function() {
            return _.extend({
                //"dblclick": "dblclick"
            }, this.base.events())
        },
        initialize: function() {
            this.model.attributes.width = this.model.get('parent').get('width')
            this.base.initialize.apply(this, arguments)
        },
        close: function() {
            this.base.close.apply(this, arguments)
        }
    })
    
    var baseview = ItemEditInlineView 
    
    ItemEditViews[type] = baseview.extend({
        minwidth: 12,
        render: function() {
            //baseview.prototype.render.apply(this, arguments)
            this.renderTemplate()
            $(".ckeditor", this.options.parent.el).ckeditor(ckeditor_config)
            return this
        },
        events: function() {
            return _.extend({
                //"dblclick": "dblclick"
            }, baseview.prototype.events())
        },
        initialize: function() {
            baseview.prototype.initialize.apply(this, arguments)
        },
        save: function() {
            this.model.set({html: this.$(".ckeditor").val()})
            baseview.prototype.save.apply(this, arguments)
        },
        close: function() {
            this.$(".ckeditor").ckeditorGet().destroy()
            baseview.prototype.close.apply(this, arguments)
        }
    })

})()

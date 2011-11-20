(function() {

    var type = "gallery"
    
    ItemViews[type] = ItemView.extend({
        base: ItemView.prototype,
        render: function() {
            var self = this
            this.base.render.apply(this, arguments)
            this.$(".imagelink").fancybox({ // TODO: can trim down the CSS and remove images
                cyclic: true,
                hideOnContentClick: true,
                overlayOpacity: 0.2,
                showCloseButton: false,
                title: this.renderTemplate({template: "item-gallery-title", target: null}),
                titlePosition: 'over',
                onComplete: function() {
                    $("#fancybox-wrap").mousemove(function() { // TODO: more efficient, but still hides by default?
                        $("#fancybox-title").fadeIn(200)
                    })
                    $("#fancybox-wrap").mouseleave(function() {
                        $("#fancybox-title").stop().fadeOut(200)
                    })
                    $("#fancybox-title").hide()
                }
            })
            return this
        },
        events: function() {
            return _.extend({
                //"dblclick": "dblclick"
            }, this.base.events())
        },
        initialize: function() {
            this.model.attributes.width = 5
            this.base.initialize.apply(this, arguments)
        },
        close: function() {
            this.base.close.apply(this, arguments)
        }
    })
    
    var baseview = ItemEditInlineView 
    
    ItemEditViews[type] = baseview.extend({
        minwidth: 5,
        render: function() {
            baseview.prototype.render.apply(this, arguments)
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
        close: function() {
            baseview.prototype.close.apply(this, arguments)
        }
    })

})()

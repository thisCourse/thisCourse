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
            this.model.attributes.width = 4
            this.base.initialize.apply(this, arguments)
        },
        close: function() {
            this.base.close.apply(this, arguments)
        }
    })
    
    var baseview = ItemEditInlineView 
    
    ItemEditViews[type] = baseview.extend({
        minwidth: 4,
        render: function() {
            baseview.prototype.render.apply(this, arguments)
            this.enablePlaceholders()
            var self = this
            this.$("iframe.uploader").load(function() {
	            var response_text = $("body", $("iframe").contents()).text()
	            var response_json = response_text ? JSON.parse(response_text) : {}
				if (response_json.image) {
					self.loadDownloadFrame("Success!")
					$("input[data=image_url]").val(response_json.image.url).change()
					if (response_json.thumb) $("input[data=thumb_url]").val(response_json.thumb.url).change()
				} else if (response_json._error) {
					self.loadDownloadFrame("Error!")
				}
	        })
            this.loadDownloadFrame()
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
        loadDownloadFrame: function(message) {
        	var self = this
        	$.get("/s3?" + Math.random(), function(policy_params) {
        		var url = "https://thiscourse.s3.amazonaws.com/uploader/imageupload.html#policy:" + policy_params.policy + ",signature:" + policy_params.signature
	        	if (message) url += ",message:" + message
	        	self.$("iframe.uploader").attr("src", url)
        	})
        },
        close: function() {
            baseview.prototype.close.apply(this, arguments)
        }
    })

})()

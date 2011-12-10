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
        	// TODO: fetch a live policy and use it here
        	var policy = "eyJleHBpcmF0aW9uIjoiMjAxMi0wMS0wMVQwMDowMDowMFoiLCJjb25kaXRpb25zIjpbeyJidWNrZXQiOiJ0aGlzY291cnNlIn0sWyJzdGFydHMtd2l0aCIsIiRrZXkiLCJ1cGxvYWRzLyJdLHsiYWNsIjoicHVibGljLXJlYWQifSxbImNvbnRlbnQtbGVuZ3RoLXJhbmdlIiwwLDEwNDg1NzZdLFsic3RhcnRzLXdpdGgiLCIkbmFtZSIsIiJdLFsic3RhcnRzLXdpdGgiLCIkRmlsZW5hbWUiLCIiXSxbInN0YXJ0cy13aXRoIiwiJHN1Y2Nlc3NfYWN0aW9uX3N0YXR1cyIsIiJdXX0="
        	var signature = "5I6tyYvu7M58QxizUXrf/3O1DPs="
        	var url = "https://thiscourse.s3.amazonaws.com/uploader/imageupload.html#policy:" + policy + ",signature:" + signature
        	if (message) url += ",message:" + message
        	this.$("iframe.uploader").attr("src", url)
        },
        close: function() {
            baseview.prototype.close.apply(this, arguments)
        }
    })

})()

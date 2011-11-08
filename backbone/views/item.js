ItemView = Backbone.View.extend({
    tagName: "span",
    className: "item",
    template: "item",
    render: function() {
        //console.log("itemview render")
        this.el.html(Handlebars.templates.item())
        this.$('.itemtitle').text(this.model.get("title"))
        this.$('.attributes').text("")
        var self = this
        _.each(_.keys(this.model.attributes), function(attr) {
            if (attr!="title" && attr!="_id" && attr!="parent" && attr!="width")
                self.$('.attributes').append("<div class='attr_" + attr + "'><b>" + attr + ":</b> " + self.model.get(attr) + "</div>")
        })
        this.updateWidth()
        return this
    },
    events: {
        "click .itemtitle": "edit"
    },
    initialize: function() {
        this.el = $(this.el)
        this.el.attr('id', this.model.id)
        this.model.bind('change', this.render, this)
        this.render()
        //console.log("itemview initialized")
    },
    updateWidth: function() {
        this.el.attr('class', this.el[0].className.replace(/\bgrid_\d+\b/g, ''))
        this.el.addClass("grid_" + this.model.get("width"))
    },
    edit: function() {
      this.model.save({"title": this.model.get("title") + " :)"})
    }    
})
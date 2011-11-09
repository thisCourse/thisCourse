ItemView = Backbone.View.extend({
    tagName: "span",
    className: "item",
    template: "item",
    render: function() {
        this.renderTemplate()
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
    },
    edit: function() {
      this.model.save({"title": this.model.get("title") + " :)"})
    }    
})
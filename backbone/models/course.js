Course = Backbone.RelationalModel.extend({
    relations: [{
        type: Backbone.HasMany,
        key: 'lectures',
        relatedModel: 'Lecture',
        collectionType: 'LectureCollection',
        includeInJSON: ["_id", "title", "description"],
        reverseRelation: {
            key: 'course',
            includeInJSON: "_id"
        }
    }, {
        type: Backbone.HasOne,
        key: 'content',
        relatedModel: 'Content',
        includeInJSON: "_id",
        reverseRelation: {
            key: 'course',
            includeInJSON: "_id",
            type: Backbone.HasOne
        }
    }],
    urlRoot: '/api/course',
    initialize: function() {
        var self = this
        this.bind("change:content", function() {
            self.fetchRelated("content")
        })
        this.bind("remove:lectures", function() {
            alert("removing")
        })        
        //this.get('sections').url = function() { return self.url() + "/sections" }
    }
})

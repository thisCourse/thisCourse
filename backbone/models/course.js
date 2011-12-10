Course = Backbone.RelationalModel.extend({
    relations: [{
        type: Backbone.HasMany,
        key: 'lectures',
        relatedModel: 'Lecture',
        collectionType: 'LectureCollection',
        includeInJSON: ["_id", "title", "description", "scheduled", "page"],
        reverseRelation: {
            key: 'course',
            includeInJSON: "_id"
        }
    }, {
        type: Backbone.HasMany,
        key: 'assignments',
        relatedModel: 'Assignment',
        collectionType: 'AssignmentCollection',
        includeInJSON: ["_id", "title", "description", "due", "page"],
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
        // this.bind("change:content", function() {
            // self.fetchRelated("content")
        // })
        // this.bind("add:lectures", function() {
            // alert("lecture added")
        // })        
        // this.bind("add:assignments", function() {
            // alert("assignment added")
        // })
        //this.get('sections').url = function() { return self.url() + "/sections" }
    }
})

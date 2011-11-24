Course = Backbone.RelationalModel.extend({
    relations: [{
        type: Backbone.HasMany,
        key: 'lectures',
        relatedModel: 'Lecture',
        collectionType: 'LectureCollection',
        includeInJSON: ["_id", "title", "description", "scheduled", "page"],
        reverseRelation: {
            key: 'course',
            includeInJSON: false
        }
    }, {
        type: Backbone.HasMany,
        key: 'assignments',
        relatedModel: 'Assignment',
        collectionType: 'AssignmentCollection',
        includeInJSON: ["_id", "title", "description", "due"],
        reverseRelation: {
            key: 'course',
            includeInJSON: false
        }
    }, {
        type: Backbone.HasOne,
        key: 'content',
        relatedModel: 'Content',
        includeInJSON: true,
        reverseRelation: {
            key: 'course',
            includeInJSON: false,
            type: Backbone.HasOne
        }
    }],
    urlRoot: '/api/course',
    initialize: function() {
        var self = this
        // this.bind("change:content", function() {
            // self.fetchRelated("content")
        // })
        this.bind("remove:lectures", function() {
            alert("removing")
        })        
        //this.get('sections').url = function() { return self.url() + "/sections" }
    }
})

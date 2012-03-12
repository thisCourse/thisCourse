Backbone.Model.prototype.idAttribute = "_id";

class window.LazyModel extends Backbone.Model

    loaded: false
    loading: false

    constructor: ->
        @relations = @relations?() or @relations or {}
        super

    set: (attributes, options) ->
        for key,opts of @relations
            console.log @, key, opts, attributes
            if opts.collection and _.isArray(attributes[key])
                attributes[key] = new opts.collection(attributes[key])
            else if opts.model
                if _.isString(attributes[key])
                    attributes[key] = {_id: attributes[key]}
                if _.isObject(attributes[key])
                    attributes[key] = new opts.model(attributes[key])
        super attributes, options

class Lecture extends LazyModel
    relations: ->
        content:
            model: ContentModel

class LectureCollection extends Backbone.Collection
    model: Lecture

class CourseModel extends LazyModel

    relations: ->
        lectures:
            collection: LectureCollection
            includeInJSON: ["title", "description", "scheduled", "page"]
        content:
            model: ContentModel

class ContentModel extends LazyModel

window.course = new CourseModel
    lectures: [{_id: "1", content: {_id: "77", data: "Stuff"}}, {_id: "2"}]
    content: {_id: "17"}


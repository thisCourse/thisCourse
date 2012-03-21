Backbone.Model.prototype.idAttribute = "_id";

class window.LazyModel extends Backbone.Model

    loaded: false
    loading: false

    constructor: ->
        @relations = @relations?() or @relations or {}
        for key,relation of @relations
            if not (relation.model or relation.collection)
                throw "Error: All relations must specify either a model or a collection (key: '" + key + "')"
            relation.includeInJSON or= []
        super

    set: (attributes, options) ->
        idAttribute = Backbone.Model.prototype.idAttribute
        for key,opts of @relations
            if opts.collection # if it's a "one to many" relation
                collection = attributes[key] = new opts.collection(attributes[key]) # turn array into collection
                collection.url = (@url?() or @url) + key # TODO: do a better join? what if parent not saved yet?
                for model in collection.models # add a parent link to each of the collection's models
                    model.parent = {model: @, key: key}
            else if opts.model # if it's a "one to one" relation
                if _.isString(attributes[key]) # if just a string, assume it's an id and put it in an object
                    attributes[key] = {_id: attributes[key]}
                if _.isObject(attributes[key]) # if it's an object (should be!), then turn it into a model
                    model = attributes[key] = new opts.model(attributes[key])
                    model.parent = {model: @, key: key} # add a parent link to the model
                    model.url = (@url?() or @url) + key # TODO: do a better join? what if parent not saved yet?
        super attributes, options

    toJSON: ->
        attrs = super
        if @parent
            attrs.parent =
                model: @parent.model.constructor.name
                key: @parent.key
            if @parent.model.id
                attrs.parent[Backbone.Model.prototype.idAttribute] = @parent.model.id
        idAttribute = Backbone.Model.prototype.idAttribute
        for key of attrs
            if key of @relations
                attrs[key] = attrs[key].toJSON()
                relation = @relations[key]
                if relation.model
                    models = [attrs[key]]
                else if relation.collection
                    models = attrs[key]
                for model in models
                    for modelkey of model
                        if modelkey not in relation.includeInJSON and modelkey != idAttribute
                            delete model[modelkey]
        return attrs

    saveRelated: (fields) ->
        fields or= [field for field of @related]
        if _.isString(fields) then fields = [fields]
        #for field in fields
            # should we save specific fields, or just the whole parent?


class Lecture extends LazyModel

    urlRoot: "/api/lecture/"

    relations: ->
        content:
            model: ContentModel
            includeInJSON: ['html']

class LectureCollection extends Backbone.Collection

    model: Lecture


class CourseModel extends LazyModel

    urlRoot: "/api/course/"

    relations: ->
        lectures:
            collection: LectureCollection
            includeInJSON: ["title", "description", "scheduled", "page"]
        content:
            model: ContentModel
            includeInJSON: ['html']

# _full_url
# _denormed_fields
# _is_collection

class ContentModel extends LazyModel

    urlRoot: "/api/content/"


window.course = new CourseModel
    _id: "999"
    lectures: [{_id: "1", content: {_id: "77", data: "Stuff", html: "yeahhhhhh"}}, {_id: "2"}]
    content: {_id: "17", html: "ooga booga"}

console.log course.get("lectures").at(0).toJSON()


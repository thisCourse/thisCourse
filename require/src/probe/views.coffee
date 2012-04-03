define ["cs!base/views", "cs!./models", "cs!page/views", "cs!content/items/views", "cs!dialogs/views", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, pageviews, itemviews, dialogviews, templates, styles) ->

    class ProbeRouterView extends baseviews.RouterView

        routes: =>
            "": => view: ProbeListView, datasource: "collection"
            ":probe_id/": (probe_id) => view: ProbeView, datasource: "collection", key: probe_id

        initialize: ->
            console.log "ProbeRouterView init"
            super

    class ProbeListView extends baseviews.BaseView

        events:
            "click .add-button": "addNewProbe"
            "click .delete-button": "addNewProbe"

        render: =>
            # console.log "rendering ProbeListView"
            @$el.html templates.probe_list @context()
            @makeSortable()
            
        initialize: ->
            # console.log "init ProbeListView"
            @collection.bind "change", @render
            @collection.bind "remove", @render
            @collection.bind "add", @render
            @render()            

        addNewProbe: =>
            dialogviews.dialog_request_response "Please enter a question:", (questiontext) => #TODO: Actually make this useable for adding probe questions
                @collection.create questiontext: questiontext

        deleteProbe: (ev) =>
            probe = @collection.get(ev.target.id)
            dialogviews.delete_confirmation probe, "probe", =>
                @collection.remove probe

        # probeAdded: (model, coll) =>
        #     alert "added"
        #     @$('ul').append("<li>" + model.get("title") + "</li>")

        makeSortable: ->
            # @$("ul").sortable
            #     update: (event, ui) ->
            #         new_order = self.$("ul").sortable("toArray")
            #         self.collection.reorder new_order
            #         app.course.save()

            #     opacity: 0.6
            #     tolerance: "pointer"

    class ProbeView extends baseviews.BaseView

        events:
            "click .answerbtn": "submitAnswer"

        render: =>
            console.log "There are four lights!"
            @$el.html templates.probe @context()
        
        
        initialize: =>
            
                    
        submitAnswer: =>
            
            
    class ProbeAnswerView extends baseviews.BaseView
        
        el: $('.answerlist')
        
        events:
            "click .answer" : "selectAnswer"
        
        render: =>
            @$el.html templates.probe_answer @context()
        
            
        selectAnswer: =>
            @$('.answer').toggleClass('active')
            @options.parent.selected = @model

    class ProbeResponseView extends baseviews.BaseView
        
        el: $('.proberesponse')
        
        initialize: -> @render()

        events: => _.extend super,
            "click .nextquestion" : "nextQuestion"
            "click #feedbut" : "showFeedback"
                
        showFeedback: ->
            $('#feedback').slideToggle()
            
        nextQuestion: ->
            #TODO: Callback to parent, next item in collection
        
        render: =>
            @$el.html templates.probe_response @context()
            Backbone.ModelBinding.bind @


    class ProbeEditView extends baseviews.BaseView

        initialize: ->
            @mementoStore()
            @render()
        
        render: =>
            @$el.html templates.probe_edit @context()
            Backbone.ModelBinding.bind @
            @enablePlaceholders()

        events: #-> _.extend super,
            "click button.save": "save"
            "click button.cancel": "cancel"

        save: =>
            @$("input").blur()
            @$(".save.btn").button "loading"
            @model.save().success =>
                @parent.render()
                @parent.editDone()

        cancel: =>
            @mementoRestore()
            @parent.editDone()

            
    ProbeRouterView: ProbeRouterView
    ProbeListView: ProbeListView
    ProbeView: ProbeView
    ProbeTopView: ProbeResponseView
    ProbeTopEditView: ProbeEditView
    
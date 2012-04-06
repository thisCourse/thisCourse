define ["cs!base/views", "cs!./models", "cs!ui/dialogs/views", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, dialogviews, templates, styles) ->

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
            if not @model then return
            @subviews = {} #TODO: Hack to clear answer subviews on each question. Replace with Question subviews.
            @$el.html templates.probe @context(increment:@inc,total:@collection.length)
            @$('.question').html @model.get('questiontext')
            for answer in @model.get('answers').models
                @addAnswers answer, @model.get("answers")
            @timestamp_load = new Date
            
        
        initialize: =>
            # @collection.shuffle()
            @$el.html "Please make sure you are logged in to continue. Refresh after login."
            $.get '/analytics/', (inc) =>
                @inc = parseInt(inc)
                @nextProbe()   
            # @model.get("answers").bind "change", @toggleButton    

        # toggleButton: =>
        #     for subview of @subviews
        #         if @$.hasClass('select')
        #         $('.answerbtn').Class('disabled')
        #     else:
        #         $('.answerbtn').removeClass('disabled')
            
        addAnswers: (model, coll) =>
            @add_subview "answerview_"+model.id, new ProbeAnswerView(model: model), ".answerlist"
        
        nextProbe: =>
            if @inc >= @collection.length
                @$el.html "It's over, it's finally over! Thank you for your participation."
                return
            @model = @collection.at(@inc)
            @model.fetch()
            @model.bind "change", @render
            @inc += 1
                    
        submitAnswer: =>
            # model = new Backbone.Model
            #     'status': 'Correct!'
            #     'feedback':'Yes but no but, yes'
            # @add_subview "responseview", new ProbeResponseView(model: model), ".proberesponse"
            if @$('.answerbtn').attr('disabled') then return
            @$('.answerbtn').attr('disabled','disabled')
            responsetime = new Date - @timestamp_load
            response = probe: @model.id, type: "pretestresponse",answers:[],inc:@inc,responsetime:responsetime
            for key,subview of @subviews
                if subview.$('.answer').hasClass('select') then response.answers.push subview.model.id
            if response.answers.length == 0
                alert "Please Select at least one answer"
                @$('.answerbtn').removeAttr('disabled')
                return
            $.post '/analytics/', response, =>
                @nextProbe()
            
            
            
    class ProbeAnswerView extends baseviews.BaseView
        
        events:
            "click .answer" : "selectAnswer"
        
        render: =>
            # console.log "There are four LIGHTS!"
            @$el.html templates.probe_answer @context()
        
            
        selectAnswer: =>
            @$('.answer').toggleClass('select')

    class ProbeResponseView extends baseviews.BaseView
        

        
        initialize: -> @render()

        events: => _.extend super,
            "click .nextquestion" : "nextQuestion"
            "click #feedbut" : "showFeedback"
                
        showFeedback: ->
            $('#feedback').slideToggle()
            
        nextQuestion: ->
            @parent.nextProbe()
        
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
    
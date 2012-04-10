define ["cs!base/views", "cs!./models", "cs!ui/dialogs/views", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, dialogviews, templates, styles) ->

    class ProbeRouterView extends baseviews.RouterView

        routes: =>
            "": => view: ProbeListView, datasource: "collection"
            ":probe_id/": (probe_id) => view: ProbeContainerView, datasource: "collection", key: probe_id

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

    class ProbeContainerView extends baseviews.BaseView
        
        events:
            "click .answerbtn": "submitAnswer"
            "click .nextquestion" : "nextProbe"
        
        initialize: =>
            @collection.shuffle()
            @$el.html "Please make sure you are logged in to continue. Refresh after login."
            # $.get '/analytics/', (inc) =>
            #     @inc = parseInt(inc)
            #     @nextProbe()
            @inc = 0
            @nextProbe()
        
        render: =>
            @$el.html templates.probe_container
            @add_subview "probeview", new ProbeView(model: @model), ".probequestion"
           
        nextProbe: =>
            if @inc >= @collection.length
                @$el.html "Nugget Claimed!"
                return
            @model = @collection.at(@inc)
            @model.fetch()
            @model.set questionstatus: 'Correct'
            @model.bind 'change', @render
            @inc += 1
                    
        submitAnswer: =>
            if @$('.answerbtn').attr('disabled') then return
            @$('.answerbtn').attr('disabled','disabled')
            responsetime = new Date - @subviews.probeview.timestamp_load
            response = probe: @model.id, type: "proberesponse",answers:[],inc:@inc,responsetime:responsetime
            for key,subview of @subviews.probeview.subviews
                if subview.selected then response.answers.push subview.model.id
            if response.answers.length == 0
                alert "Please Select at least one answer"
                @$('.answerbtn').removeAttr('disabled')
                return
            # $.post '/analytics/', response, =>
            @$('.answerbtn').slideToggle()
            @subviews.probeview.answered()
                  
    
    
    class ProbeView extends baseviews.BaseView
              
        
        events:
            "click #feedbut" : "showFeedback"
        
        render: =>
            if not @model then return
            @$el.html templates.probe @context(increment:@parent.inc,total:@parent.collection.length)
            @$('.question').html @model.get('questiontext')
            for answer in @model.get('answers').models
                @addAnswers answer, @model.get("answers")
            @timestamp_load = new Date

        addAnswers: (model, coll) =>
            @add_subview "answerview_"+model.id, new ProbeAnswerView(model: model), ".answerlist"
        
        answered: =>
            @$('.questionstatus').append(@model.get('questionstatus'))
            @$('.nextquestion').slideToggle()
            if @model.get('feedback')
                @addFeedback()
            for key,subview of @subviews
                subview.showFeedback()
            
        addFeedback: =>
            @$('.feedback').append(@model.get('feedback'))
            @$('#feedbut').slideToggle()
            
        showFeedback: =>
            @$('.feedback').slideToggle()
                   


    class ProbeAnswerView extends baseviews.BaseView

        events:
            "click .answer" : "selectAnswer"
        
        initialize: =>
            @selected = false
        
        render: =>
            @$el.html templates.probe_answer @context()
        
            
        selectAnswer: =>
            @$('.answer').toggleClass('select')
            @selected = not @selected
            
        showFeedback: =>
            console.log 'Feedback!'
            if @model.get('correct')
                @$('.answertext').addClass('showing')
            console.log @selected,@model.get('correct')
            if @selected then @addFeedback()
        
        addFeedback: =>
            console.log 'No feedback?',@model.get('correct')
            if @model.get('correct') 
                checkorcross = '<span class="check">&#10003;</span>'
            else
                checkorcross = '<span class="cross">&#10005;</span>'
            @$('.checkorcross').append(checkorcross)
            if @model.get('feedback')
                @$('.feedback').append(@model.get('feedback'))
                @$('feedback').slideToggle()


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
    ProbeContainerView: ProbeContainerView
    ProbeTopEditView: ProbeEditView
    
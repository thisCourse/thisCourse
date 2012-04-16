define ["cs!base/views", "cs!./models", "cs!ui/dialogs/views", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, dialogviews, templates, styles) ->

    class ProbeRouterView extends baseviews.RouterView

        routes: =>
            "": => view: ProbeContainerView, datasource: "collection"
            "edit/": => view: ProbeListView, datasource: "collection"
            "edit/:probe_id/": (probe_id) => view: ProbeEditView, datasource: "collection", key: probe_id

        initialize: ->
            # console.log "ProbeRouterView init"
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
            for model in @collection.models
                model.fetch()
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

    doPost = (url, data, success) ->
        $.ajax
            type: 'POST'
            url: url
            data: JSON.stringify(data)
            success: success
            contentType: 'application/json'

    class ProbeContainerView extends baseviews.BaseView
        
        events:
            "click .answerbtn": "submitAnswer"
            "click .nextquestion" : "nextProbe"
        
        initialize: =>
            @collection = new Backbone.Collection(@collection.shuffle())
            # if not require('app').get('loggedIn')
            #     @$el.html "Please make sure you are logged in to continue. Refresh after login."
            #     return
            @claimed = true
            @points = 0
            @inc = 0
            @nextProbe()
        
        render: =>
            @$el.html templates.probe_container
            @add_subview "probeview", new ProbeView(model: @model), ".probequestion"
           
        nextProbe: =>
            if @inc >= @collection.length
                nuggetattempt = claimed: @claimed, nugget: @model.parent.model.id, points: @points
                doPost '/analytics/nuggetattempt/', nuggetattempt, =>
                    if @claimed
                        @$el.html "Nugget Claimed!"
                        require('app').get('user').get('claimed').add _id: @model.parent.model.id, points: @points
                    else
                        @$el.html "Practice makes better!"
                        require('app').get('user').get('partial').add _id: @model.parent.model.id
                return
            @model = @collection.at(@inc)
            @model.fetch success: @render
            @inc += 1
                    
        submitAnswer: =>
            if @$('.answerbtn').attr('disabled') then return
            @$('.answerbtn').attr('disabled','disabled')
            responsetime = new Date - @subviews.probeview.timestamp_load
            response = probe: @model.id, type: "proberesponse",answers:[],responsetime:responsetime
            for key,subview of @subviews.probeview.subviews
                if subview.selected then response.answers.push subview.model.id
            if response.answers.length == 0
                alert "Please Select at least one answer"
                @$('.answerbtn').removeAttr('disabled')
                return
            doPost '/analytics/proberesponse/', response, (data) =>
                @$('.answerbtn').hide()
                if not data.correct 
                    @claimed = false
                else
                    for answer in data.probe.answers
                        @points += answer.correct or 0
                @subviews.probeview.answered(data)
                  
    
    
    class ProbeView extends baseviews.BaseView
              
        
        events:
            "click #feedbut" : "showFeedback"
        
        render: =>
            if not @model then return
            @$el.html templates.probe @context(increment:@parent.inc,total:@parent.collection.length)
            @$('.question').html @model.get('questiontext')
            for answer in _.shuffle(@model.get('answers').models)
                @addAnswers answer, @model.get("answers")
            @timestamp_load = new Date

        addAnswers: (model, coll) =>
            @add_subview "answerview_"+model.id, new ProbeAnswerView(model: model), ".answerlist"
        
        answered: (response)=>
            @model.set response.probe
            if response.correct
                @$('.questionstatus').append('Correct')
            else
                @$('.questionstatus').append('Incorrect')
            @$('.nextquestion').show()
            for key,subview of @subviews
                subview.showFeedback()
            if @model.get('feedback')
                @feedback = true
                @addFeedback()
            if @feedback then @$('#feedbut').show()
            
        addFeedback: =>
            @$('#qfeedback').append(@model.get('feedback'))
            
        showFeedback: =>
            @$('.feedback').stop().slideDown()
                   


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
            if @model.get('correct')
                @$('.answertext').addClass('showing')
                if @model.get('feedback')
                    @$('.feedback').append(@model.get('feedback'))
                    @parent.feedback = true
            if @selected then @addFeedback()

        
        addFeedback: =>
            if @model.get('correct') 
                checkorcross = '<span class="check">&#10003;</span>'
            else
                checkorcross = '<span class="cross">&#10005;</span>'
                if @model.get('feedback')
                    @$('.feedback').append(@model.get('feedback'))
                    @parent.feedback = true
            @$('.checkorcross').append(checkorcross)



    class ProbeEditView extends baseviews.BaseView

        initialize: ->
            @mementoStore()
            @render()
        
        render: =>
            @$el.html templates.probe_edit @context()
            Backbone.ModelBinding.bind @
            @enablePlaceholders()
            for answer in @model.get('answers').models
                @addAnswers answer, @model.get("answers")

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
            
        addAnswers: (model, coll) =>
            @add_subview "answerview_"+model.id, new ProbeAnswerEditView(model: model), ".answerlist"
            
        
    class ProbeAnswerEditView extends baseviews.BaseView

        events:
            "dblclick .answer" : "editAnswer"
            "dblclick .feedback": "editFeedback"
            "keypress .answertext" : "updateAnswerOnEnter"
            "keypress .answerfeedbacktext" : "updateFeedbackOnEnter"
        
        initialize: =>

        
        render: =>
            @$el.html templates.probe_answer_edit @context()

        edit: (aclass) =>
            @$(aclass).addClass('editing')
        
        stopEdit: (aclass) =>
            @$(aclass).removeClass('editing')
        
        editAnswer: =>
            @edit('.answer')
        
        editFeedback: =>
            @edit('.feedback')
        
        finish: (aclass) =>
            if aclass=='.answer'
                console.log @$('.answertext').value
                @model.set text:@$('.answertext').value
                @stopEdit(aclass)
            else if aclass=='.feedback'
                @model.set feedback:@$('.answerfeedback').value
                @stopEdit(aclass)
        
        updateAnswerOnEnter: (event) =>
            @updateOnEnter(event,'.answer')
            
        updateFeedbackOnEnter: (event) =>
            @updateOnEnter(event,'.feedback')
        
        updateOnEnter: (event,aclass) =>
            if event.keyCode == 13 then @finish(aclass)
            
    ProbeRouterView: ProbeRouterView
    ProbeListView: ProbeListView
    ProbeView: ProbeView
    ProbeContainerView: ProbeContainerView
    ProbeTopEditView: ProbeEditView
    
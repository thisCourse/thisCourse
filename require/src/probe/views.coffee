define ["cs!base/views", "cs!./models", "cs!ui/dialogs/views", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, dialogviews, templates, styles) ->

    class ProbeRouterView extends baseviews.RouterView

        routes: =>
            "": => view: ProbeContainerView, datasource: "collection", notclaiming: @options.notclaiming, nofeedback: @options.nofeedback
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

        addNewProbe: =>
            @collection.create {},
                success: (model) => require("app").navigate model.id
            

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
            # if not require('app').get('loggedIn')
            #     @$el.html "Please make sure you are logged in to continue. Refresh after login."
            #     return
            if @options.notclaiming then @review = []
            @claimed = true
            @points = 0
            @inc = 0
            @earnedpoints = 0
            # @starttime = new Date
        
        render: =>
            @$el.html templates.probe_container()
            @add_subview "probeview", new ProbeView(model: @model), ".probequestion"
            
        navigate: (fragment, query) =>
            if @options.notclaiming
                # console.log @query
                # console.log "pre", @collection.length
                # console.log @collection.select(@query).models
                @collection = new Backbone.Collection(_.shuffle(_.flatten((probe for probe in nugget.get('probeset').models) for nugget in @collection.select(@query).models)))
                # console.log "post", @collection
            else
                @collection = new Backbone.Collection(@collection.shuffle())
            @nextProbe()
            if not _.isEqual query, @query then _.defer @render # re-render the view if the query changed
            super
           
        nextProbe: =>
            if @inc >= @collection.length
                if not @options.notclaiming
                    nuggetattempt = claimed: @claimed, nugget: @model.parent.model.id, points: @points
                    doPost '/analytics/nuggetattempt/', nuggetattempt, =>
                        if @claimed
                            @$el.html "<h4>Nugget Claimed!</h4>"
                            require('app').get('user').get('claimed').add _id: @model.parent.model.id, points: @points
                        else
                            @$el.html "<h4>Practice makes better!</h4>"
                            require('app').get('user').get('partial').add _id: @model.parent.model.id
                    return
                else
                    if @review.length > 0
                        @$el.html templates.nugget_review_list collection: new Backbone.Collection(_.uniq(@review)), query: @query, totalpoints: @points, earnedpoints: @earnedpoints
                    else
                        @$el.html templates.nugget_review_list query: @query, totalpoints: @points, earnedpoints: @earnedpoints
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
                    if @options.notclaiming                        
                        @review.push @model.parent.model
                selected = (subview.model.id for key,subview of @subviews.probeview.subviews when subview.selected)
                correct = (answer._id for answer in data.probe.answers when answer.correct)
                increment = if selected.length <= correct.length then _.intersection(selected,correct).length else _.intersection(selected,correct).length - (selected.length-correct.length)
                @earnedpoints += if increment > 0 then increment else 0
                for answer in data.probe.answers
                    @points += answer.correct or 0
                if @options.nofeedback then @nextProbe() else @subviews.probeview.answered(data)
                  
    
    
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
                @$('.questionstatus').append('<h3 style="color:#22FF22">Correct</h3>')
            else
                @$('.questionstatus').append('<h3 style="color:#FF2222">Incorrect</h3>')
            @$('.nextquestion').show()
            if @parent.inc == @parent.collection.length
                if @parent.claimed == true and not @parent.options.notclaiming #TODO: Remove this to fully modularize probes
                    @$('.nextquestion').text('Claim Nugget!')
                else
                    @$('.nextquestion').text('Finish Quiz')
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
            @model.bind "change", @render
            @newans = 0
        
        render: =>
            @$el.html templates.probe_edit @context()
            # Backbone.ModelBinding.bind @
            # @enablePlaceholders()
            for answer in @model.get('answers').models
                @addAnswers answer, @model.get("answers")

        events: #-> _.extend super,
            "click button.save": "save"
            "click button.cancel": "cancel"
            "dblclick .question" : "editQuestion"
            "dblclick .questionfeedback": "editFeedback"
            "keypress .question_text" : "updateQuestionOnEnter"
            "keypress .feedback_text" : "updateFeedbackOnEnter"
            "click .addanswer"  : "createAnswer"

        save: =>
            @$("input").blur()
            @$(".save.btn").button "loading"
            @model.save().success =>
                console.log @url
                @return()

        cancel: =>
            @mementoRestore()
            @return()
        
        edit: (aclass) =>
            @$(aclass).addClass('editing')
        
        stopEdit: (aclass) =>
            @$(aclass).removeClass('editing')
        
        editQuestion: =>
            @edit('.question')
        
        editFeedback: =>
            @edit('.questionfeedback')
        
        finish: (aclass) =>
            if aclass=='.question'
                @model.set question_text:@$('.question_text')[0].value
                @stopEdit(aclass)
            else if aclass=='.questionfeedback'
                @model.set feedback:@$('.feedback_text')[0].value
                @stopEdit(aclass)
        
        updateQuestionOnEnter: (event) =>
            @updateOnEnter(event,'.question')
            
        updateFeedbackOnEnter: (event) =>
            @updateOnEnter(event,'.questionfeedback')
        
        updateOnEnter: (event,aclass) =>
            if event.keyCode == 13 then @finish(aclass)
        
            
        return: =>
            require("app").navigate @url + ".."
            
        createAnswer: =>
            answer = @model.get('answers').create {}
            @addAnswers answer,@model.get('answers')
            @newans += 1
            
        addAnswers: (model, coll) =>
            viewid = model.id or @newans
            @add_subview "answerview_"+viewid, new ProbeAnswerEditView(model: model), ".answerlist"
            
        
    class ProbeAnswerEditView extends baseviews.BaseView

        events:
            "dblclick .answer" : "editAnswer"
            "dblclick .feedback": "editFeedback"
            "keypress .answertext" : "updateAnswerOnEnter"
            "keypress .answerfeedbacktext" : "updateFeedbackOnEnter"
            "click .answerfeedback" : "toggleFeedback"
            "click .delete-button" : "delete"
            "click .check_correct" : "toggleCorrect"
        
        initialize: =>
            @model.bind "change", @render
            @model.bind "destroy", @close
            @editing = ''

        render: =>
            @$el.html templates.probe_answer_edit @context()

        delete: =>
            @model.destroy()

        edit: (aclass) =>
            @$(aclass).addClass('editing')
            @editing = aclass
        
        stopEdit: (aclass) =>
            @$(aclass).removeClass('editing')
            @editing = ''
        
        editAnswer: =>
            if @editing then @finish(@editing)
            @edit('.answer')
        
        editFeedback: =>
            if @editing then @finish(@editing)
            @edit('.feedback')
        
        finish: (aclass) =>
            if aclass=='.answer'
                @stopEdit(aclass)
                @model.set text:@$('.answertext')[0].value
            else if aclass=='.feedback'
                @stopEdit(aclass)
                @model.set feedback:@$('.answerfeedbacktext')[0].value
        
        updateAnswerOnEnter: (event) =>
            @updateOnEnter(event,'.answer')
            
        updateFeedbackOnEnter: (event) =>
            @updateOnEnter(event,'.feedback')
        
        updateOnEnter: (event,aclass) =>
            if event.keyCode == 13 then @finish(aclass)
                
        toggleFeedback: (event) =>
            if @editing then @finish(@editing)
            @$('.feedback_text').toggleClass('hidden')
            if @$(event.target).is(':checked')
                @finish('.feedback')
            else
                @model.set feedback:''
                
        toggleCorrect: =>
            if @editing then @finish(@editing)
            @model.set correct:not @model.get('correct')
            
    ProbeRouterView: ProbeRouterView
    ProbeListView: ProbeListView
    ProbeView: ProbeView
    ProbeContainerView: ProbeContainerView
    ProbeTopEditView: ProbeEditView
    
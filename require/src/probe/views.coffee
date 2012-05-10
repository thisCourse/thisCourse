define ["cs!base/views", "cs!./models", "cs!ui/dialogs/views", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, dialogviews, templates, styles) ->

    class ProbeRouterView extends baseviews.RouterView

        routes: =>
            "": => view: ProbeContainerView, datasource: "collection", notclaiming: @options.notclaiming, nofeedback: @options.nofeedback, sync:QuizAnalytics
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
            
    QuizAnalytics =
        submitQuestion: (response,callback) =>
            doPost '/analytics/proberesponse/', response, (data) =>
                callback data
                
        nuggetAttempt: (nuggetattempt,callback) =>
            doPost '/analytics/nuggetattempt/', nuggetattempt, =>
                callback()
                
    ExamAnalytics =
        submitQuestion: (response,callback) =>
            doPost '/analytics/midterm/', response, (data) =>
                callback data
                
        skipQuestion: (response,callback) =>
            doPost '/analytics/midterm/', response, =>
                callback()

    class ExamView extends baseviews.BaseView
        
        events:
            "click .claimed": "claimed"
            "click .generic": "generic"
        
        initialize: ->

        render: =>
            $.get '/analytics/midterm/', (data) =>
                if typeof(data)=="string"
                    midtermgradeboundaries = [180,160,150,140,0]
                    @$el.html templates.exam_entry_screen points: data, grade: grades[(Number(data)>=x for x in midtermgradeboundaries).indexOf(true)]
                else if typeof(data)=="object"
                    probes = ({_id: probe} for probe in data.reverse())
                    if probes.length==0 then return
                    probes = new models.ProbeCollection(probes)
                    @add_subview "probecontainer", new ProbeContainerView(collection: probes, notclaiming: true, nofeedback: @options.nofeedback, sync:ExamAnalytics)

        navigate: (fragment, query) =>
            super
            @render()
            
        claimed: =>
            dialogviews.dialog_confirmation "Take Claimed Midterm","This will choose the midterm you have created. Once you choose this, it cannot be undone.", =>
                @chooseGeneric(false)
            , confirm_button:"Choose", cancel_button:"Cancel"
                
        generic: =>
            dialogviews.dialog_confirmation "Take Generic Midterm","This will choose a generic midterm with a particular if you have created your own midterm, this option is not recommended. Once you choose this, it cannot be undone.", =>
                @chooseGeneric(true)
            , confirm_button:"Choose", cancel_button:"Cancel"
            
        chooseGeneric: (choice) =>
            code = @$('.entrycode').val()
            $.put '/analytics/midterm/', alternate: choice, code: code, =>
                @render()
        
    class QuizView extends baseviews.BaseView
        
        initialize: ->
            @collection.bind "add", _.debounce @render

        render: =>
            probes = []
            for nugget in @collection.selectNuggets(@query).models
                for probe in nugget.get('probeset').models
                    probes.push probe
            if probes.length==0 then return
            probes = new models.ProbeCollection(_.shuffle(probes))
            @add_subview "probecontainer", new ProbeContainerView(collection: probes, notclaiming: true, nofeedback: @options.nofeedback, sync:QuizAnalytics)

        navigate: (fragment, query) =>
            super
            @render()


    class ProbeContainerView extends baseviews.BaseView
        
        events:
            "click .answerbtn": "submitAnswer"
            "click .nextquestion" : "nextProbe"
            "click .skipbutton" : "skipQuestion"
        
        initialize: ->
            # if not require('app').get('loggedIn')
            #     @$el.html "Please make sure you are logged in to continue. Refresh after login."
            #     return
            console.log "COLLECTION LENGTH:", @collection.length
            if @options.notclaiming
                @review = []
            if @options.nofeedback
                require("app").bind "windowBlur", @performQuestionSkipping
            @claimed = true
            @points = 0
            @inc = 0
            @earnedpoints = 0
            @submitting = 0
            # @starttime = new Date
            @showNextProbe()
            @model.fetch()
        
        render: =>
            @$el.html templates.probe_container notclaiming: @options.notclaiming
            if @submitting == 1
                @$('.answerbtn').attr('disabled','disabled')
                @$('.answerbtn').text('Loading')
            @add_subview "probeview", new ProbeView(model: @model), ".probequestion"
                       
        nextProbe: =>
            if @$('.nextquestion').attr('disabled') then return
            @$('.nextquestion').attr('disabled','disabled')
            if @inc >= @collection.length
                require("app").unbind "windowBlur", @performQuestionSkipping
                if not @options.notclaiming
                    nuggetattempt = claimed: @claimed, nugget: @model.parent.model.id, points: @points
                    @options.sync.nuggetAttempt nuggetattempt, =>
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
                    else if @earnedpoints > 0
                        @$el.html templates.nugget_review_list query: @query, totalpoints: @points, earnedpoints: @earnedpoints
                    else
                        @$el.html "Test Complete - Your Grade will be available on the Course Site after grading"
                    return
            @showNextProbe()

        showNextProbe: =>
            @model = @collection.at(@inc)
            @inc += 1
            @model.whenLoaded @render
            @prefetchProbe()

        prefetchProbe: =>
            @collection.at(@inc)?.fetch()
                    
        submitAnswer: =>
            if @options.nofeedback then @submitting = 1
            if @$('.answerbtn').attr('disabled') then return
            @$('.answerbtn').attr('disabled','disabled')
            @$('.answerbtn').text('Loading')
            @$('.skipbutton').attr('disabled','disabled')
            @$('.skipbutton').text('Loading')
            responsetime = new Date - @subviews.probeview.timestamp_load
            response = probe: @model.id, type: "proberesponse",answers:[],responsetime:responsetime
            for key,subview of @subviews.probeview.subviews
                if subview.selected then response.answers.push subview.model.id
            if response.answers.length == 0
                alert "Please select at least one answer"
                @$('.answerbtn').removeAttr('disabled')
                return
            @options.sync.submitQuestion response, (data) =>
                if not @options.nofeedback then @$('.answerbtn').hide()
                if @options.sync.nuggetAttempt
                    if not data.correct 
                        @claimed = false
                        if @options.notclaiming
                            @review.push @model.parent.model
                    selected = (subview.model.id for key,subview of @subviews.probeview.subviews when subview.selected)
                    correct = (answer._id for answer in data.probe.answers when answer.correct)
                    increment = if selected.length <= correct.length then _.intersection(selected,correct).length else _.intersection(selected,correct).length - (selected.length-correct.length)
                    @earnedpoints += Math.max(0, increment)
                    for answer in data.probe.answers # calculate the total number of points possible in the probe
                        @points += answer.correct or 0
                    if not @options.nofeedback then @subviews.probeview.answered(data)
                if @options.nofeedback
                    @$('.answerbtn').removeAttr('disabled')
                    @$('.answerbtn').text('Submit Answer')
                    @$('.skipbutton').removeAttr('disabled')
                    @$('.skipbutton').text('Skip Question')
                    @submitting = 0
            if @options.nofeedback then @nextProbe()
                
        skipQuestion: =>
            console.log "skipping question"
            if @$('.skipbutton').attr('disabled') then return
            if (subview for key,subview of @subviews.probeview.subviews when subview.selected).length>0
                dialogviews.dialog_confirmation "Skip Question","This will skip this question, your answers will not be saved", =>
                    @performQuestionSkipping()
                , confirm_button:"Skip", cancel_button:"Cancel"
            else
                @performQuestionSkipping()
            
            
        performQuestionSkipping: =>
            if @options.nofeedback then @submitting = 1
            @$('.answerbtn').attr('disabled','disabled')
            @$('.answerbtn').text('Loading')
            @$('.skipbutton').attr('disabled','disabled')
            @$('.skipbutton').text('Loading')
            @options.sync.skipQuestion? probe: @model.id, skipped: true, =>
                @$('.answerbtn').removeAttr('disabled')
                @$('.answerbtn').text('Submit Answer')
                @$('.skipbutton').removeAttr('disabled')
                @$('.skipbutton').text('Skip Question')
                @submitting = 0
            skipmodel = @collection.models.splice(@inc-1,1)
            @collection.models.push skipmodel[0]
            @model = @collection.at(@inc-1)
            @model.whenLoaded @render
            @prefetchProbe()


    class ProbeView extends baseviews.BaseView
              
        
        events:
            "click #feedbut" : "showFeedback"
        
        render: =>
            if not @model then return
            nuggettitle = if @parent.options.notclaiming then @model.parent.model.get('title')
            console.log nuggettitle
            @$el.html templates.probe @context(increment:@parent.inc,total:@parent.collection.length,nuggettitle:nuggettitle)
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
    ExamView: ExamView
    QuizView: QuizView
    ProbeTopEditView: ProbeEditView
    
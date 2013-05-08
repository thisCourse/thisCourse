define ["cs!base/views", "cs!./models", "cs!ui/dialogs/views", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, dialogviews, templates, styles) ->

    class ProbeRouterView extends baseviews.RouterView

        routes: =>
            "": => view: ProbeContainerView, datasource: "collection", notclaiming: @options.notclaiming, nofeedback: @options.nofeedback, sync:QuizAnalytics

        initialize: ->
            # console.log "ProbeRouterView init"
            super

    class ProbeEditRouterView extends baseviews.RouterView

        routes: =>
            "": => view: QuestionTypeListView, datasource: "model"
            "preview/probe/": => view: ProbeContainerView, datasource: "model", key: "probeset", notclaiming: true, nofeedback: false, sync:QuizAnalytics
            "preview/exam/": => view: ProbeContainerView, datasource: "model", key: "examquestions", notclaiming: true, nofeedback: false, sync:QuizAnalytics
            "probe/:probe_id/": (probe_id) => view: ProbeEditView, datasource: "model", key: "probeset", probe: probe_id
            "exam/:probe_id/": (probe_id) => view: ProbeEditView, datasource: "model", key: "examquestions", probe: probe_id

        initialize: ->
            # console.log "ProbeEditRouterView init"
            super

    class QuestionTypeListView extends baseviews.BaseView
        
        render: =>
            if app.get("user").get("email") is "admin"
                @add_subview "probelist", new QuestionListView(collection: @model.get("probeset"), title: "Probe", path:"probe/")
                @add_subview "examlist", new QuestionListView(collection: @model.get("examquestions"), title: "Exam Question", path: "exam/")
            else
                @$el.html "<p>Wouldn't you prefer a nice game of chess?</p>"

    class QuestionListView extends baseviews.BaseView

        events:
            "click .add-button": "addNewProbe"
            "click .delete-button": "addNewProbe"

        render: =>
            # console.log "rendering ProbeListView"
            @points = 0
            for model in @collection.models
                for answer in model.get("answers").models
                    if answer.get("correct") then @points++
            @$el.html templates.question_list @context(points: @points)
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
                success: (model) => require("app").navigate @options.path + model.id
            

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

    doPut = (url, data, success) ->
        $.ajax
            type: 'PUT'
            url: url
            data: JSON.stringify(data)
            success: success
            contentType: 'application/json'
    
    handleError = ->
        alert "There was an error loading; please check your internet connection and then refresh the page to continue..."
    
    QuizAnalytics =
        submitQuestion: (response, callback) =>
            xhdr = doPost '/analytics/proberesponse/', response, (data) =>
                callback data
            xhdr.error handleError
                
        nuggetAttempt: (nuggetattempt, callback) =>
            xhdr = doPost '/analytics/nuggetattempt/', nuggetattempt, =>
                callback()
            xhdr.error handleError

        skipQuestion: (response, callback) =>
            callback()
                
    MidtermAnalytics =
        submitQuestion: (response, callback) =>
            xhdr = doPost '/analytics/midterm/', response, (data) =>
                callback data
            xhdr.error handleError
                
        skipQuestion: (response, callback) =>
            xhdr = doPost '/analytics/midterm/', response, =>
                callback()
            xhdr.error handleError
            
    FinalAnalytics =
        submitQuestion: (response, callback) =>
            xhdr = doPost '/analytics/final/', response, (data) =>
                callback data
            xhdr.error handleError
                
        skipQuestion: (response, callback) =>
            xhdr = doPost '/analytics/final/', response, =>
                callback()
            xhdr.error handleError

    PostTestAnalytics =
        submitQuestion: (response, callback) =>
            xhdr = doPost '/analytics/posttest/', response, (data) =>
                callback data
            xhdr.error handleError
            
    PreTestAnalytics =
        submitQuestion: (response, callback) =>
            xhdr = doPost '/analytics/pretest/', response, (data) =>
                callback data
            xhdr.error handleError

    class MidtermView extends baseviews.BaseView
        
        events:
            "click .claimed": "claimed"
        
        initialize: =>
            require("app").get("user").bind "change:loggedIn", @render
        
        render: =>
            if not require("app").get("user").get("loggedIn")
                @$el.html "<p>Please log in to take your midterm...</p>"
                return
            xhdr = $.get '/analytics/midterm/', (data) =>
                if data.points
                    @$el.html templates.exam_entry_screen
                else if typeof(data)=="object"
                    @$el.html ""
                    probes = ({_id: probe} for probe in data.probes.reverse())
                    if probes.length==0
                        @$el.html "You're done. Finito. Finished!! If you want to leave early, please come and sign out at the front of the room. Otherwise, please close your laptop now so we know you're finished."
                        return
                    probes = new models.ProbeCollection(probes)
                    probes.url = "/api/probe"
                    @add_subview "probecontainer", new ProbeContainerView(collection: probes, notclaiming: true, nofeedback: true, progress: data.progress, sync:MidtermAnalytics)
            xhdr.error handleError
            
        claimed: =>
            @code = @$('.entrycode').val()
            if @code.length != 4
                alert "You must enter the 4 digit code given to you by your instructor."
                return
            @chooseGeneric(false)
            
        chooseGeneric: (choice) =>
            console.log "CODE:", @code
            doPut '/analytics/midterm/', alternate: choice, code: @code, @render
            
    class FinalView extends baseviews.BaseView
        
        events:
            "click .claimed": "claimed"
            "click .generic": "generic"
        
        initialize: =>
            require("app").get("user").bind "change:loggedIn", @render
        
        render: =>
            if not require("app").get("user").get("loggedIn")
                @$el.html "<p>Please log in to take your final...</p>"
                return
            xhdr = $.get '/analytics/final/', (data) =>
                if data.points
                    finalgradeboundaries = [315,280,263,240,0]
                    grades = ['A','B','C','D','F']
                    @$el.html templates.exam_entry_screen points: data.points, grade: grades[(Number(data.points)>=x for x in finalgradeboundaries).indexOf(true)]
                else if typeof(data)=="object"
                    @$el.html ""
                    probes = ({_id: probe} for probe in data.probes.reverse())
                    if probes.length==0
                        @$el.html "You're done. Finito. Finished!! If you want to leave early, please come and sign out at the front of the room. Otherwise, please close your laptop now so we know you're finished."
                        return
                    probes = new models.ProbeCollection(probes)
                    probes.url = "/api/probe"
                    @add_subview "probecontainer", new ProbeContainerView(collection: probes, notclaiming: true, nofeedback: true, progress: data.progress, sync:FinalAnalytics)
            xhdr.error handleError
            
        claimed: =>
            @code = @$('.entrycode').val()
            if @code.length != 4
                alert "You must enter the 4 digit code given to you by your instructor."
                return
            dialogviews.dialog_confirmation "Take Claimed Final","This will choose the final you have created. Once you choose this, it cannot be undone.", =>
                @chooseGeneric(false)
            , confirm_button:"Choose", cancel_button:"Cancel"
                
        generic: =>
            @code = @$('.entrycode').val()
            if @code.length != 4
                alert "You must enter the 4 digit code given to you by your instructor."
                return
            dialogviews.dialog_confirmation "Take Generic Final","This will choose a generic final with a particular if you have created your own final, this option is not recommended. Once you choose this, it cannot be undone.", =>
                @chooseGeneric(true)
            , confirm_button:"Choose", cancel_button:"Cancel"
            
        chooseGeneric: (choice) =>
            console.log "CODE:", @code
            doPut '/analytics/final/', alternate: choice, code: @code, @render


    class PreTestView extends baseviews.BaseView
        
        initialize: =>
            require("app").get("user").bind "change:loggedIn", @render
        
        render: =>
            if not require("app").get("user").get("loggedIn")
                @$el.html "<p>Please log in to take your pre-test...</p>"
                return
            xhdr = $.get '/analytics/pretest/', (data) =>
                @$el.html ""
                probes = ({_id: probe} for probe in data.probes.reverse())
                if probes.length==0
                    @$el.html "You're done. Finito. Finished!!"
                    return
                probes = new models.ProbeCollection(probes)
                @add_subview "probecontainer", new ProbeContainerView
                    collection: probes
                    notclaiming: true
                    nofeedback: true
                    noskipping: true
                    progress: data.progress
                    sync: PreTestAnalytics
                    complete: @complete
            xhdr.error handleError
        
        complete: =>
            @$el.html "Thanks, all done!"


    class PostTestView extends baseviews.BaseView
        
        initialize: =>
            require("app").get("user").bind "change:loggedIn", @render
        
        render: =>
            if not require("app").get("user").get("loggedIn")
                @$el.html "<p>Please log in to take your post-test...</p>"
                return
            xhdr = $.get '/analytics/posttest/', (data) =>
                @$el.html ""
                probes = ({_id: probe} for probe in data.probes.reverse())
                if probes.length==0
                    @$el.html "You're done. Finito. Finished!!"
                    return
                probes = new models.ProbeCollection(probes)
                @add_subview "probecontainer", new ProbeContainerView
                    collection: probes
                    notclaiming: true
                    nofeedback: true
                    noskipping: true
                    progress: data.progress
                    sync: PostTestAnalytics
                    complete: @complete
            xhdr.error handleError
        
        complete: =>
            @$el.html "Thanks, ALMOST done! You will now be redirected to an <a href='http://bit.ly/M9mlCF'>anonymous feedback form</a>."
            setTimeout @redirect, 5000

        redirect: =>
            window.location = "http://bit.ly/M9mlCF"
        
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
            # console.log "COLLECTION LENGTH:", @collection.length
            if @options.notclaiming
                @review = []
            if @options.nofeedback and not @options.noskipping
                require("app").bind "windowBlur", @performQuestionSkipping
            @claimed = true
            @progress = Number(@options.progress or 0)
            @points = 0
            @inc = @options.inc or 0
            @earnedpoints = 0
            @submitting = 0
            # @starttime = new Date
            @showNextProbe()
            xhdr = @model.fetch()
            xhdr?.error handleError
        
        render: =>
            @$el.html templates.probe_container allowskipping: @options.notclaiming and not @options.noskipping
            if @submitting == 1
                @$('.answerbtn, .skipbutton').attr('disabled','disabled')
                @$('.answerbtn, .skipbutton').text('Loading')
            @add_subview "probeview", new ProbeView(model: @model), ".probequestion"
                       
        nextProbe: =>
            if @$('.nextquestion').attr('disabled') then return
            @$('.nextquestion').attr('disabled','disabled')
            if @inc >= @collection.length
                require("app").unbind "windowBlur", @performQuestionSkipping
                @inc += 1
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
                    @showReviewFeedback()
                    return
            else
                @showNextProbe()
        
        showReviewFeedback: =>
            # console.log @review
            # console.log @earnedpoints
            if @review.length > 0
                @$el.html templates.nugget_review_list collection: new Backbone.Collection(_.uniq(@review)), query: @query, totalpoints: @points, earnedpoints: @earnedpoints
            else if @earnedpoints > 0
                @$el.html templates.nugget_review_list query: @query, totalpoints: @points, earnedpoints: @earnedpoints
            else if @options.complete
                @options.complete()
            else
                @$el.html "Test Complete - Your grade will be available on the course site after grading. If you want to leave early, please come and sign out at the front of the room. Otherwise, please close your laptop now so we know you're finished."

        showNextProbe: =>
            @model = @collection.at(@inc)
            @inc += 1
            @model.whenLoaded @render
            @prefetchProbe()

        prefetchProbe: =>
            xhdr = @collection.at(@inc)?.fetch()
            xhdr?.error handleError
                    
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
            console.log require('app').get('user').get('email'), "answered question", response.probe, "with", response.answers
            @options.sync.submitQuestion response, (data) =>
                if not @options.nofeedback then @$('.answerbtn, .skipbutton').hide()
                if @options.sync.nuggetAttempt
                    if not data.correct 
                        @claimed = false
                        if @options.notclaiming
                            @review.push @model.parent.model
                    correct = (answer._id for answer in data.probe.answers when answer.correct)
                    increment = if response.answers.length <= correct.length then _.intersection(response.answers,correct).length else _.intersection(response.answers,correct).length - (response.answers.length-correct.length)
                    @earnedpoints += Math.max(0, increment)
                    @points += correct.length
                    if not @options.nofeedback then @subviews.probeview.answered(data)
                if @options.nofeedback
                    @$('.answerbtn').removeAttr('disabled')
                    @$('.answerbtn').text('Submit Answer')
                    @$('.skipbutton').removeAttr('disabled')
                    @$('.skipbutton').text('Skip Question')
                    @submitting = 0
                    if @inc > @collection.length
                        @showReviewFeedback()
            if @options.nofeedback and @inc <= @collection.length then @nextProbe()
                
        skipQuestion: =>
            console.log "skipping question"
            if @$('.skipbutton').attr('disabled') then return
            if (subview for key,subview of @subviews.probeview.subviews when subview.selected).length>0
                dialogviews.dialog_confirmation "Skip Question","This will skip this question, your answers will not be saved", =>
                    @performQuestionSkipping(true)
                , confirm_button:"Skip", cancel_button:"Cancel"
            else
                @performQuestionSkipping(true)
            
            
        performQuestionSkipping: (manual) =>
            if @options.nofeedback then @submitting = 1
            @$('.answerbtn').attr('disabled','disabled')
            @$('.answerbtn').text('Loading')
            @$('.skipbutton').attr('disabled','disabled')
            @$('.skipbutton').text('Loading')
            @options.sync.skipQuestion? probe: @model.id, skipped: true, manual: manual or false, =>
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
            nuggettitle = @parent.options.notclaiming and @model.parent?.model?.get('title') or ""
            # console.log nuggettitle
            @$el.html templates.probe @context(increment:@parent.inc+@parent.progress,total:@parent.collection.length+@parent.progress,nuggettitle:nuggettitle)
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
            @collection.bind "change", @render
            @newans = 0
            # console.log "Init ProbeEditView"
        
        render: =>
            @model = @collection.get(@options.probe)
            @$el.html templates.probe_edit @context()
            # Backbone.ModelBinding.bind @
            # @enablePlaceholders()
            for answer in @model.get('answers').models
                @addAnswers answer, @model.get("answers")

        events: #-> _.extend super,
            "click button.save": "save"
            "click button.cancel": "cancel"
            "click .addanswer"  : "createAnswer"
            "change .question_text" : "updateQuestion"
            "change .feedback_text" : "updateFeedback"

        save: =>
            @$("input").blur()
            @$(".save.btn").button "loading"
            @model.save().success =>
                console.log @url
                @return()

        cancel: =>
            @mementoRestore()
            @return()
        
        updateQuestion: (event) =>
            @model.set question_text: @$('.question_text')[0].value
            
        updateFeedback: (event) =>
            @model.set feedback:@$('.feedback_text')[0].value
        
        return: =>
            require("app").navigate @url + "../.."
            
        createAnswer: =>
            answer = @model.get('answers').create {}
            @addAnswers answer,@model.get('answers')
            @newans += 1
            
        addAnswers: (model, coll) =>
            viewid = model.id or @newans
            @add_subview "answerview_"+viewid, new ProbeAnswerEditView(model: model), ".answerlist"
            
        
    class ProbeAnswerEditView extends baseviews.BaseView

        events:
            "change .answerfeedback" : "toggleFeedback"
            "click .delete-button" : "delete"
            "click .check_correct" : "toggleCorrect"
            "change .answertext" : "updateAnswer"
            "change .answerfeedbacktext" : "updateFeedback"
        
        initialize: =>
            @model.bind "change", @render
            @model.bind "destroy", @close

        render: =>
            @$el.html templates.probe_answer_edit @context()

        delete: =>
            @model.destroy()
        
        updateAnswer: (event) =>
            @model.set text:@$('.answertext')[0].value
            
        updateFeedback: (event) =>
            @model.set feedback:@$('.answerfeedbacktext')[0].value
                
        toggleFeedback: (event) =>
            @$('.feedback').toggleClass('hidden')
            if not @$(event.target).is(':checked')
                console.log event
                @model.set feedback:''
                
        toggleCorrect: =>
            @model.set correct:not @model.get('correct')
            
    ProbeRouterView: ProbeRouterView
    ProbeEditRouterView: ProbeEditRouterView
    QuestionListView: QuestionListView
    ProbeView: ProbeView
    ProbeContainerView: ProbeContainerView
    MidtermView: MidtermView
    FinalView: FinalView
    PostTestView: PostTestView
    PreTestView: PreTestView
    QuizView: QuizView
    ProbeTopEditView: ProbeEditView
    
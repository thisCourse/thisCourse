define ["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, templates, styles) ->

    examples = ({ html: item, correct: true, _id: _.last(item.split("/")).split(".")[0] } for item in ["<img src='/static/images/practice/cat1.jpg' class='stimulus'>", "<img src='/static/images/practice/cat2.png' class='stimulus'>", "<img src='/static/images/practice/cat3.jpg' class='stimulus'>"])
    distractors = ({ html: item, correct: false, _id: _.last(item.split("/")).split(".")[0] } for item in ["<img src='/static/images/practice/dog1.jpg' class='stimulus'>", "<img src='/static/images/practice/dog2.jpg' class='stimulus'>", "<img src='/static/images/practice/dog3.jpg' class='stimulus'>", "<img src='/static/images/practice/dog4.jpg' class='stimulus'>", "<img src='/static/images/practice/dog5.jpg' class='stimulus'>", "<img src='/static/images/practice/dog6.jpg' class='stimulus'>", "<img src='/static/images/practice/dog7.jpg' class='stimulus'>", "<img src='/static/images/practice/dog8.jpg' class='stimulus'>", "<img src='/static/images/practice/dog9.jpg' class='stimulus'>"])
    practiceModule =
        new models.TrainingModel exemplar: "<p class='title'>cat</p>",
        examples: (new models.ResponseModel(example) for example in examples),
        distractors: (new models.ResponseModel(distractor) for distractor in distractors),
        _id: "practice"

    handleError = ->
        alert "There was an error loading; please check your internet connection and then refresh the page to continue..."
    
    
    PracticeAnalytics =
        submitQuestion: (response, callback) =>
            xhdr = doPost '/analytics/practiceresponse/', response, (data) =>
                callback data
            xhdr.error handleError

        skipQuestion: (response, callback) =>
            xhdr = doPost '/analytics/practiceresponse/', response, (data) =>
                callback data
            xhdr.error handleError
    
    
    TrainingAnalytics =
        submitQuestion: (response, callback) =>
            xhdr = doPost '/analytics/trainingresponse/', response, (data) =>
                callback data
            xhdr.error handleError

        skipQuestion: (response, callback) =>
            xhdr = doPost '/analytics/trainingresponse/', response, =>
                callback()
            xhdr.error handleError

    PostTestAnalytics =
        submitQuestion: (response, callback) =>
            xhdr = doPost '/analytics/posttestresponse/', response, (data) =>
                callback data
            xhdr.error handleError
        
        skipQuestion: (response, callback) =>
            xhdr = doPost '/analytics/posttestresponse/', response, =>
                callback()
            xhdr.error handleError

    class ChoiceRouterView extends baseviews.RouterView

        routes: =>
            "": => view: ChoiceControlView, datasource: "collection", nonpersistent: true

        initialize: =>
            super
            
    class ChoiceControlView extends baseviews.BaseView
        
        events:
            "click .trainingchoice": "chooseTraining"
            "click .understand": "nextInstructions"
            "click .posttest": "postTestStart"
        
        render: =>
            if not require("app").get("user").get("loggedIn")
                @$el.html "<p>Please log in to begin the experiment.</p>"
                return
            if /msie/i.test window.navigator.userAgent
                @$el.html "<p>Please use Chrome, Firefox, or Safari to complete the experiment.</p>"
                return
            @collection.fetchAll()
            switch @readinst
                when 0
                    @$el.html templates.initial_instructions
                    return
                when 1
                    @$el.html templates.warnings
                when 2
                    @$el.html ""
                    @add_subview "practiceview", new TrainingContainerView(model: practiceModule, sync: PracticeAnalytics, practice: true)
                when 3
                    @$el.html templates.ready_to_start
                else
                    @initializeConditions()
                    @$el.html templates.choice_control
                    @add_subview "choiceselectionview", new ChoiceSelectionView(collection: @filteredcollection, condition: @conditions[@inc]), ".choiceselectionview"
        
        initialize: =>
            require("app").get("user").bind "change:loggedIn", @render
            @collection.bind "change", @render
            @collection.bind "remove", @render
            @collection.bind "add", _.debounce @render, 50 # TODO: this gets fired a kazillion times!
            @inc = 0
            @readinst = 0
        
        nextInstructions: =>
            @readinst += 1
            @render()
        
        initializeConditions: =>
            @trainingconditions = {}
            @trialmodels = (training.id for training in @collection.models)
            @setFilteredCollection()
            trialnos = ((@collection.length - 1) - (@collection.length - 1)%2)/2
            @conditions = (4 for x in [1..trialnos])
            @conditions.push.apply @conditions, (3 for x in [1..trialnos])
            if @collection.models.length%2 == 0 then @conditions.push Math.round Math.random() + 3
            @conditions = _.shuffle(@conditions)
            @conditions.push 4
            if @conditions[@inc] == 4 then @selectedmodel = _.shuffle(@filteredcollection.models)[0]
        
        setFilteredCollection: =>
            @trialmodels = _.shuffle(@trialmodels)
            @filteredcollection = @collection.filterWithIds(@trialmodels.slice(0,2))
            if @filteredcollection.length < 2 then @filteredcollection.add exemplar: "<p class='title'>plak</p>", unselectable: true
        
        chooseTraining: (ev) ->
            @collection.unbind "change"
            @collection.unbind "remove"
            @collection.unbind "add"
            condition = @conditions[@inc]
            getname = />([a-z]+)</i
            if condition == 3
                id = ev.currentTarget.id
                @trainingconditions[id] = condition
                training = @collection.get(id)
                choicename = getname.exec(training.get("exemplar"))[1]
                choicetext = "<h1 class='choicemade'>You chose <b style='color: blue;'>#{choicename}</b> you are now learning <b style='color: blue;'>#{choicename}</b>.</h1>"
            if condition == 4
                id = @selectedmodel.id
                @trainingconditions[id] = condition
                training = @collection.get(id)
                choicename = getname.exec(training.get("exemplar"))[1]
                choicetext = "<h1 class='choicemade'>The computer chose <b style='color: blue;'>#{choicename}</b> you are now learning <b style='color: blue;'>#{choicename}</b>.</h1>"
            @trialmodels = _.without @trialmodels, id
            @$(".choiceselectionview").html choicetext
            @add_subview "trainingcontainerview", new TrainingContainerView(model: training, sync: TrainingAnalytics, condition: condition, trainingconditions: @trainingconditions), ".choicetrainingview"
    
        complete: =>
            if @inc <= @collection.length then @completeTraining() else @endExperiment()
    
        completeTraining: =>
            @subviews.trainingcontainerview.close()
            @$(".choiceselectionview").html ""
            @inc += 1
            if @inc < @collection.length
                @setFilteredCollection()
                if @conditions[@inc] == 4 then @selectedmodel = @collection.get(@trialmodels[0])
                @add_subview "choiceselectionview", new ChoiceSelectionView(collection: @filteredcollection, condition: @conditions[@inc]), ".choiceselectionview"
            else
                @inc +=1
                @postTest()
    
        postTest: =>
            @$(".choiceselectionview").html templates.post_test
            
        postTestStart: =>
            @$(".choiceselectionview").html ""
            @add_subview "trainingcontainerview", new TrainingContainerView(collection: @collection, sync: PostTestAnalytics, trainingconditions: @trainingconditions, condition: 11, nofeedback: true), ".choicetrainingview"
            
        endExperiment: =>
            variantid = app.get("course").id
            response = email: require("app").get("user").get("email"), experimentcomplete: true, variantid: variantid
            xhdr = doPost '/analytics/experimentcomplete/', response, (data) =>
                if data then @$el.html "<h1>You are done, you will receive a follow up debrief via email. Thank you for your participation!</h1>"
            xhdr.error handleError
        
    class ChoiceSelectionView extends baseviews.BaseView
        
        render: =>
            if @options.condition == 3
                @$el.html templates.choice_selection
            if @options.condition == 4
                @$el.html templates.nochoice_selection
            for model in _.shuffle(@collection.models)
                @add_subview "choiceselection" + model.id, new ChoiceSelectionModelView(model: model, disabled: @options.condition == 4), ".choices"
            # if @options.condition == 4
            #     @$('exemplar').attr('disabled', 'disabled')
            #     @$('.choosetraining').toggleClass('choose').toggleClass('choosetraining')
            #     @$('.click').toggleClass('choosetraining')                


    class ChoiceSelectionModelView extends baseviews.BaseView
        
        initialize: =>
            @model.bind "change", @render
            if not @model.get("unselectable") then @model.fetch()
        
        render: =>
            @$el.html templates.choice_selection_model @context(disabled: @options.disabled)

    class TrainingListView extends baseviews.BaseView

        render: =>
            @$el.html templates.training_list @context()
            

    class TrainingContainerView extends baseviews.BaseView
        
        events:
            "click .responseitem": "selectResponse"
            "mouseout .buttonhole": "setLaunchTime"
        
        initialize: =>
            if @options.criterion then @proficiency = [0,0,0,0,0,0,0,0,0,0]
            require("app").bind "windowBlur", @alertLeavingWindow
            if @collection then @generateTestCollection() else @collection = new Backbone.Collection @pairsFromModel(@model,false)
            @inc = 0
            @responseToNextTrainingTime = -1
            @launchTime = []
        
        
        pairsFromModel: (model,test) =>
            trainingid = model.id
            exemplar = model.get("exemplar")
            examples = model.get("examples").models.slice(0)
            distractors = model.get("distractors").models.slice(0)
            tests = model.get("tests").models
            if test then examples.push.apply examples, tests
            distractorlist = _.shuffle([0..(distractors.length - 1)])
            pairs = []
            tempxamples = examples.slice(0)
            repeat = if test then 4 else 1
            if @options.practice then repeat = 2
            for i in [0...repeat]
                examples.push.apply examples, tempxamples
            for example in examples
                distractor = distractors[distractorlist.pop(0)]
                pairs.push new Backbone.Model
                                exemplar: exemplar,
                                responses: new Backbone.Collection([example, distractor]),
                                trainingid: trainingid
            pairs = _.shuffle(pairs)
            return pairs
            
        generateTestCollection: =>
            pairs = []
            @collection.fetchAll()
            @collection.whenLoaded => 
                for model in @collection.models
                    pairs.push.apply pairs, @pairsFromModel(model, true)           
            @collection = new Backbone.Collection _.shuffle(pairs)
        
        updateProficiency: (correct) =>
            @proficiency.pop 0
            @proficiency.push if correct then 1 else 0
        
        render: =>
            @$el.html templates.training_container
            @prefetchTraining()
            @showNextTraining()
            
        nextSubView: =>
            @currentview = @nextview
            if @currentview
                @add_subview "trainingview", @currentview, ".trainingquestion"
                @currentview.stamp()

        nextTraining: =>
            @responseToNextTrainingTime = new Date - @responseSelectTime
            @$('.nexttraining').attr('disabled','disabled')
            if not @options.criterion
                if @inc < @collection.length
                    @showNextTraining()
                else @finish()
            else
                sum = @profiency.reduce (t,s) -> t + s
                average = sum/@proficiency.length
                if average < 0.9
                    if @inc > @collection.length
                        @inc = 0
                        @collection = new Backbone.Collection _.shuffle(@collection.models)
                    @showNextTraining()
                else
                    @finish()

        showNextTraining: =>
            @launchTime = []
            @undelegateEvents()
            @training = @collection.at(@inc)
            @inc += 1
            @nextSubView()
            @delegateEvents()
            @prefetchTraining()

        setLaunchTime: =>
            @launchTime.push new Date

        prefetchTraining: =>
            @nextview = if @collection.at(@inc) then new TrainingView(model: @collection.at(@inc)) else null

        selectResponse: (ev) =>
            @responseSelectTime = new Date
            # if @responding = true then return true else @responding = true
            @undelegateEvents()
            if @inc >= @collection.length then @$('.nexttraining').text("Next Selection").toggleClass("success danger")

            trainingid = @training.get("trainingid")
            
            answer = ev.currentTarget.id
            
            if not @options.practice
                condition = if @options.condition < 10 then @options.condition else @options.trainingconditions[trainingid] or 10
            
            loadtime = @subviews.trainingview.timestamp_load
            
            responseItemTimes = @subviews.trainingview.getResponseTimes()
            
            answers = (key for key, object of responseItemTimes)
            
            firstHover = Math.min.apply 0, (responseItemTimes[ans].hoverStarts?[0] for ans in answers)
            
            firstHoverOnResponse = responseItemTimes[answer].hoverStarts?[0] or loadtime
            
            lastHover = _.last responseItemTimes[answer].hoverStarts or [loadtime]
            
            variantid = app.get("course").id
            
            response =
                variantid: variantid
                training: trainingid
                options: answers
                type: "trainingresponse"
                answer: answer
                responsetime: @responseSelectTime - loadtime
                delaybefore: @responseToNextTrainingTime
                loadtolaunch: @launchTime[0] - loadtime
                loadtofirsthover: firstHover - loadtime
                launchtofirsthover: firstHover - @launchTime[0]
                loadtofirsthoveronresponse: firstHoverOnResponse - loadtime
                launchtofirsthoveronresponse: firstHoverOnResponse - @launchTime[0]
                itemtimes: responseItemTimes
                loadtolasthover: lastHover - loadtime
                launchtolasthover: lastHover - @launchTime[0]
                mouselog: @subviews.trainingview.mouseLog
                condition: condition
                variant: "short"
            
            @options.sync.submitQuestion response, (data) =>
                if not @options.nofeedback
                    if @options.practice then data.correct = @training.get("responses").get(answer).get("correct")
                    @subviews.trainingview.answered(data)
                    if @options.criterion then @updateProficiency(data.correct)
                @delegateEvents "click .nexttraining": "nextTraining"
                @$('.nexttraining').removeAttr('disabled')

        alertLeavingWindow: =>
            answers = (response.id for response in @training.get("responses").models)
            @options.sync.skipQuestion? training: @model.get("_id"), tabbedout: true, answers: answers,  =>
                alert "Stay in the Window: Do not leave the browser window during the experiment, this has been logged."

        finish: =>
            if @options.practice then @.parent.nextInstructions() else @.parent.complete()

    class TrainingView extends baseviews.BaseView
        
        events:
            "mousemove": "logging"
        
        initialize: =>
            @mouseLog = []
            @clocktime = new Date
        
        render: =>
            @$el.html templates.training @context()
            for response in _.shuffle(@model.get("responses").models)
                @add_subview "responseview_"+response.id, new ResponseView(model: response), ".responses"
        
        answered: (data) =>
            feedback = if data.correct then '<span class="check">&#10003; CORRECT</span>' else '<span class="cross">&#10005; INCORRECT</span>'
            @$('.feedback').html feedback
            @$('.nexttraining').show()
            for key, subview of @subviews
                subview.addFeedback()
        
        # throttledLogging: _.throttle @logging, 50
        
        logging: (ev) =>
            if @clocktime - new Date < 50 then return
            x = ev.pageX - @$el.offset().left
            y = ev.pageY - @$el.offset().top
            @clocktime = new Date
            @mouseLog.push clocktime: @clocktime, x: x, y: y, t: @clocktime - @timestamp_load
        
        stamp: =>
            @timestamp_load = new Date
            
        getResponseTimes: =>
            responseTimes = {}
            for key, subview of @subviews
                responseTimes[subview.model.id] =
                    hoverStarts: subview.hoverStarts,
                    hoverStops: subview.hoverStops,
                    hoverTime: subview.hoverTime
            return responseTimes

    class ResponseView extends baseviews.BaseView
        
        events:
            "mouseover .responseitem": "hoverTimerStart"
            "mouseout .responseitem": "hoverTimerStop"
            "click .responseitem": "hoverTimerStop"
            
        initialize: =>
            @hoverTime = 0
            @hoverStarts = []
            @hoverStops = []
        
        render: =>
            @$el.html templates.response @context()
            
        hoverTimerStart: =>
            @hoverStarts.push new Date
            @hoverStart = new Date
        
        hoverTimerStop: =>
            @hoverStops.push new Date
            @hoverTime += new Date - @hoverStart
        
        addFeedback: =>
            if @model.get("correct") then @$(".responseitem").css('border','5px #22FF22 solid')
            
    doPost = (url, data, success) ->
        $.ajax
            type: 'POST'
            url: url
            data: JSON.stringify(data)
            success: success
            contentType: 'application/json'

    ChoiceRouterView: ChoiceRouterView
    TrainingListView: TrainingListView
    TrainingView: TrainingView
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
        
        render: =>
            $.get '/analytics/midterm/', (data) =>
                if data.points
                    midtermgradeboundaries = [180,160,150,140,0]
                    @$el.html templates.exam_entry_screen points: data.points, grade: grades[(Number(data.points)>=x for x in midtermgradeboundaries).indexOf(true)]
                else if typeof(data)=="object"
                    probes = ({_id: probe} for probe in data.probes.reverse())
                    if probes.length==0 then return
                    probes = new models.ProbeCollection(probes)
                    probes.url = "/api/probe"
                    @add_subview "probecontainer", new ProbeContainerView(collection: probes, notclaiming: true, nofeedback: true, progress: data.progress, sync:ExamAnalytics)
            
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
            @progress = Number(@options.progress or 0)
            @points = 0
            @inc = @options.inc or 0
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
            console.log require('app').get('user').get('email')," answered question ", response.probe," with ",response.answers
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


    probe_nugget_title = { '4f8439aee6afa5c8260028f7': 'Attention Network Test', '4f8439afe6afa5c8260028f8': 'Attention Network Test', '4f8439b1e6afa5c8260028f9': 'Attention Network Test', '4f8439dae6afa5c82600292c': 'Genetic Variants', '4f8439d4e6afa5c826002925': 'Three Networks', '4f8439d5e6afa5c826002926': 'Three Networks', '4f843a14e6afa5c826002970': 'Hebb', '4f843a16e6afa5c826002972': 'Hebb', '4f843a17e6afa5c826002973': 'Hebb', '4f843a19e6afa5c826002975': 'Hebb', '4f84396ae6afa5c826002898': 'Alerting', '4f84396be6afa5c826002899': 'Alerting', '4f84396ce6afa5c82600289b': 'Alerting', '4f843976e6afa5c8260028a9': 'Orienting', '4f843977e6afa5c8260028ab': 'Orienting', '4f843978e6afa5c8260028ac': 'Orienting', '4f843978e6afa5c8260028ad': 'Orienting', '4f84397ae6afa5c8260028af': 'Orienting', '4f843a09e6afa5c826002963': 'Executive Attention', '4f843a0ae6afa5c826002964': 'Executive Attention', '4f843a0ce6afa5c826002967': 'Executive Attention', '4f843a0de6afa5c826002968': 'Executive Attention', '4f843979e6afa5c8260028ae': 'Network Summary', '4f84397be6afa5c8260028b0': 'Network Summary', '4f84397be6afa5c8260028b1': 'Network Summary', '4f84397ce6afa5c8260028b2': 'Network Summary', '4f84397de6afa5c8260028b3': 'Network Summary', '4f84397de6afa5c8260028b4': 'Network Summary', '4f84397ee6afa5c8260028b5': 'Network Summary', '4f84397fe6afa5c8260028b6': 'Network Summary', '4f84397fe6afa5c8260028b7': 'Network Summary', '4f843962e6afa5c82600288c': 'Corbetta & Shulman\'s Neglect Model', '4f843963e6afa5c82600288d': 'Corbetta & Shulman\'s Neglect Model', '4f84398ae6afa5c8260028c6': 'Test Performance', '4f8439bbe6afa5c826002906': 'Not Just Sensory', '4f843999e6afa5c8260028db': 'Description', '4f843a11e6afa5c82600296c': 'Definition', '4f843994e6afa5c8260028d4': 'Definitions', '4f84396fe6afa5c82600289e': 'Kinds of Attention', '4f84396fe6afa5c82600289f': 'Kinds of Attention', '4f843970e6afa5c8260028a0': 'Kinds of Attention', '4f843971e6afa5c8260028a1': 'Kinds of Attention', '4f843971e6afa5c8260028a2': 'Kinds of Attention', '4f843972e6afa5c8260028a3': 'Kinds of Attention', '4f8439ece6afa5c826002941': 'Age & Gender', '4f843a04e6afa5c82600295e': 'Attention', '4f843982e6afa5c8260028bb': 'Working Memory', '4f8439ace6afa5c8260028f4': 'Response Selection', '4f843975e6afa5c8260028a8': 'Two Kinds', '4f843a01e6afa5c82600295a': 'Central Executive', '4f843a03e6afa5c82600295c': 'Central Executive', '4f843a03e6afa5c82600295d': 'Central Executive', '4f84398be6afa5c8260028c7': 'Color Attributes vs Perception', '4f84398ce6afa5c8260028c9': 'Color Attributes vs Perception', '4f843a12e6afa5c82600296e': 'Other Object Properties', '4f8439aae6afa5c8260028f1': 'Property Dissociations', '4f8439abe6afa5c8260028f3': 'Property Dissociations', '4f843961e6afa5c82600288a': 'Neural Circuit', '4f8439bde6afa5c826002908': 'Three Tasks', '4f8439bde6afa5c826002909': 'Three Tasks', '4f8439c0e6afa5c82600290c': 'Three Tasks', '4f8439c1e6afa5c82600290d': 'Three Tasks', '4f8439e7e6afa5c82600293c': 'Two Systems Summary', '4f8439e8e6afa5c82600293d': 'Two Systems Summary', '4f8439e9e6afa5c82600293e': 'Two Systems Summary', '4f8439eae6afa5c82600293f': 'Two Systems Summary', '4f8439ebe6afa5c826002940': 'Two Systems Summary', '4f8439ece6afa5c826002942': 'Two Systems Summary', '4f8439ede6afa5c826002943': 'Two Systems Summary', '4f843964e6afa5c82600288e': 'Object Concepts: Overview', '4f843964e6afa5c82600288f': 'Object Concepts: Overview', '4f843965e6afa5c826002890': 'Object Concepts: Overview', '4f843966e6afa5c826002891': 'Object Concepts: Overview', '4f843966e6afa5c826002892': 'Object Concepts: Overview', '4f843967e6afa5c826002893': 'Object Concepts: Overview', '4f843968e6afa5c826002894': 'Object Concepts: Overview', '4f843968e6afa5c826002895': 'Object Concepts: Overview', '4f843969e6afa5c826002896': 'Object Concepts: Overview', '4f84396ae6afa5c826002897': 'Object Concepts: Overview', '4f84396ce6afa5c82600289a': 'Object Concepts: Overview', '4f843988e6afa5c8260028c3': 'Object Concepts: Anatomy', '4f843988e6afa5c8260028c4': 'Object Concepts: Anatomy', '4f843984e6afa5c8260028be': 'Drug Addiction', '4f8439f6e6afa5c82600294d': 'ADHD', '4f8439f8e6afa5c826002950': 'Neuromodulators', '4f8439cfe6afa5c82600291f': 'Baddeley Model', '4f8439d0e6afa5c826002920': 'Baddeley Model', '4f8439d3e6afa5c826002924': 'Baddeley Model', '4f843992e6afa5c8260028d2': 'Feature Integration Theory', '4f8439d7e6afa5c826002928': 'Prevalence', '4f8d9e77e7c1e3251700001b': 'Prevalence', '4f8439b5e6afa5c8260028fe': 'Gradient of Effects', '4f8439ade6afa5c8260028f5': 'Activity Increases', '4f8439aee6afa5c8260028f6': 'Activity Increases', '4f8439c3e6afa5c826002910': 'Summary', '4f8439c5e6afa5c826002912': 'Summary', '4f8439c5e6afa5c826002913': 'Summary', '4f8439c7e6afa5c826002915': 'Summary', '4f8439c8e6afa5c826002916': 'Summary', '4f8439c9e6afa5c826002917': 'Summary', '4f8f24bb8222299f190013f5': 'Visual Salience', '4f84399ee6afa5c8260028e1': 'Receptive Fields', '4f8439e5e6afa5c826002939': 'Summary', '4f8439b9e6afa5c826002904': 'Opponent Process', '4f843a0be6afa5c826002966': 'Dependence', '4f8439d8e6afa5c826002929': 'Antireward Recruitment', '4f8439d9e6afa5c82600292b': 'Antireward Recruitment', '4f84396de6afa5c82600289c': 'Material Specificity', '4f843a18e6afa5c826002974': 'Drug Reward', '4f8439b2e6afa5c8260028fb': 'Vulnerability', '4f8439efe6afa5c826002945': 'Reward System Adaptation', '4f8439e3e6afa5c826002937': 'Emotional Sensitivity', '4f843985e6afa5c8260028bf': 'Neural Circuits', '4f8439b7e6afa5c826002901': 'Functional Connectivity', '4f843a08e6afa5c826002962': 'Behavioral Phenotypes', '4f8439b3e6afa5c8260028fc': 'Prediction Error Signal', '4f8439b4e6afa5c8260028fd': 'Prediction Error Signal', '4f8439fae6afa5c826002952': 'Stimulus or Response', '4f8439fbe6afa5c826002953': 'Stimulus or Response', '4f843974e6afa5c8260028a6': 'Beyond Form and Motion', '4f84399fe6afa5c8260028e2': 'Form and Motion', '4f84399fe6afa5c8260028e3': 'Form and Motion', '4f843980e6afa5c8260028b8': 'Object Category Effects', '4f843981e6afa5c8260028b9': 'Object Category Effects', '4f843982e6afa5c8260028ba': 'Object Category Effects', '4f843983e6afa5c8260028bc': 'Object Category Effects', '4f8439e6e6afa5c82600293a': 'Overview', '4f8439bce6afa5c826002907': 'Dual Roles', '4f8439f9e6afa5c826002951': 'The Race Model', '4f8439fce6afa5c826002954': 'The Race Model', '4f8439fde6afa5c826002955': 'The Race Model', '4f8439ffe6afa5c826002958': 'The Race Model', '4f843a07e6afa5c826002961': 'Inducing Emotion', '4f8439a5e6afa5c8260028eb': 'Pre-SMA', '4f84396ee6afa5c82600289d': 'Basal Gangli', '4f8439f0e6afa5c826002946': 'Right IFG', '4f843a06e6afa5c826002960': 'Training', '4f8439d6e6afa5c826002927': 'Hippocampus', '4f8439a7e6afa5c8260028ee': 'Processing vs Imagery', '4f8439a8e6afa5c8260028ef': 'Processing vs Imagery', '4f8439a9e6afa5c8260028f0': 'Processing vs Imagery', '4f8439f2e6afa5c826002948': 'Functional Connectivity', '4f843997e6afa5c8260028d9': 'Model', '4f843984e6afa5c8260028bd': 'Conceptual Processing: Conceptual?', '4f843986e6afa5c8260028c0': 'Conceptual Processing: Conceptual?', '4f843986e6afa5c8260028c1': 'Conceptual Processing: Conceptual?', '4f843987e6afa5c8260028c2': 'Conceptual Processing: Conceptual?', '4f843a0fe6afa5c82600296a': 'Symptoms', '4f8439a3e6afa5c8260028e8': 'Conceptual Processing: Clinical and Lesion Studies', '4f8439a4e6afa5c8260028e9': 'Conceptual Processing: Clinical and Lesion Studies', '4f8439a6e6afa5c8260028ec': 'Subgenual Anterior Cingulate', '4f8439c1e6afa5c82600290e': 'Qualities', '4f8439c2e6afa5c82600290f': 'Qualities', '4f8439c4e6afa5c826002911': 'Qualities', '4f8439b8e6afa5c826002902': 'Reward Value', '4f8439fee6afa5c826002956': 'Feeling States', '4f8439fee6afa5c826002957': 'Feeling States', '4f843a02e6afa5c82600295b': 'Feeling States', '4f8439a1e6afa5c8260028e5': 'Distinction', '4f8439a2e6afa5c8260028e7': 'Distinction', '4f8439d2e6afa5c826002922': 'Behavior', '4f8439d3e6afa5c826002923': 'Behavior', '4f84399de6afa5c8260028e0': 'Fear Stimuli', '4f843a19e6afa5c826002976': 'Neural Correlates', '4f843975e6afa5c8260028a7': 'Inattention', '4f843973e6afa5c8260028a5': 'Salience or Reward', '4f8439dce6afa5c82600292e': 'Bridging the Delay', '4f8439f7e6afa5c82600294e': 'The Task', '4f8439f7e6afa5c82600294f': 'The Task', '4f8439dee6afa5c826002931': 'Two Systems', '4f8439f1e6afa5c826002947': 'Ventrolateral Trend', '4f8439cae6afa5c826002918': 'Dorsal Trend', '4f8439cae6afa5c826002919': 'Dorsal Trend', '4f843997e6afa5c8260028d8': 'Mentalizing', '4f84398be6afa5c8260028c8': 'Balance', '4f84398de6afa5c8260028ca': 'Balance', '4f84398de6afa5c8260028cb': 'Balance', '4f84398ee6afa5c8260028cc': 'Balance', '4f84398fe6afa5c8260028cd': 'Balance', '4f843990e6afa5c8260028cf': 'Balance', '4f8439bee6afa5c82600290a': 'Motion', '4f843a0ee6afa5c826002969': 'Attention Set', '4f843a10e6afa5c82600296b': 'Attention Set', '4f8439b6e6afa5c8260028ff': 'Salience Modulation', '4f8439e2e6afa5c826002936': 'Visceral Knowledge', '4f843a05e6afa5c82600295f': 'Other Sets', '4f8439b6e6afa5c826002900': 'Attention Set and Working Memory', '4f8439a2e6afa5c8260028e6': 'Temporal Difference Learning', '4f8439a4e6afa5c8260028ea': 'Temporal Difference Learning', '4f8439eee6afa5c826002944': 'Learning', '4f843a1ae6afa5c826002977': 'Self-Stimulation', '4f8439e1e6afa5c826002934': 'Somatic Markers', '4f8439e4e6afa5c826002938': 'Somatic Markers', '4f84399ae6afa5c8260028dc': 'Explicit Memory', '4f84399be6afa5c8260028dd': 'Explicit Memory', '4f84399be6afa5c8260028de': 'Explicit Memory', '4f84399ce6afa5c8260028df': 'Explicit Memory', '4f8439dfe6afa5c826002932': 'Striatum', '4f8439cbe6afa5c82600291a': 'Classical Conditioning', '4f8439cce6afa5c82600291b': 'Classical Conditioning', '4f8439cde6afa5c82600291c': 'Classical Conditioning', '4f8439cee6afa5c82600291e': 'Classical Conditioning', '4f8439d1e6afa5c826002921': 'Classical Conditioning', '4f843995e6afa5c8260028d5': 'Cortical Structures', '4f8439f3e6afa5c82600294a': 'Stimulation Studies', '4f8439f4e6afa5c82600294b': 'Stimulation Studies', '4f843990e6afa5c8260028ce': 'Amygdala', '4f843992e6afa5c8260028d1': 'Amygdala', '4f843a13e6afa5c82600296f': 'Insula', '4f8439bae6afa5c826002905': 'Network', '4f8439b9e6afa5c826002903': 'Summary', '4f8439dde6afa5c82600292f': 'Example & Video', '4f8439e0e6afa5c826002933': 'Example & Video', '4f8439e7e6afa5c82600293b': 'Integration', '4f843993e6afa5c8260028d3': 'Choices', '4f9a5b72477b5e7d2a001ba6': 'Social Cognition Communication & Language', '4f96f5c1477b5e7d2a000077': 'Social Cognition Requirements: Testing', '4f96f42e477b5e7d2a000064': 'Social Cognition Requirements', '4f9a4545477b5e7d2a001b4a': 'Right TPJ: Outcome monitoring', '4f9a3fac477b5e7d2a001b3b': 'Right TPJ: Moral judgment', '4f9a38bf477b5e7d2a001b04': 'Right TPJ: Behavioral scope', '4f9af859477b5e7d2a001c81': 'Language and Theory of Mind', '4f9a37dd477b5e7d2a001afc': 'Theory of Mind: Right TPJ', '4f9ae7e2477b5e7d2a001c1b': 'Chameleon effect: Social factors', '4f9ae4cd477b5e7d2a001bf5': 'Social Communication: Chameleon effect', '4f9a5d2f477b5e7d2a001baf': 'Social Communication', '4f9ae376477b5e7d2a001bef': 'Social communication: The yawning brain', '4f9a5f64477b5e7d2a001bbc': 'Social Communication: Imitation', '4f9a4d8b477b5e7d2a001b69': 'Alternate theories of TPJ function: Attention', '4f9a508b477b5e7d2a001b93': 'Alternate theories of TPJ function: Re-test', '4f9a46d3477b5e7d2a001b4f': 'Alternate theories of TPJ function', '4f9a5411477b5e7d2a001b9b': 'Alternate Theories: Mirror neurons', '4f9a55cd477b5e7d2a001ba0': 'Theory of Mind: Summary', '4f970521477b5e7d2a00010f': 'Theory of Mind', '4f978696477b5e7d2a000bf8': 'Theory of Mind: Role in normal behavior', '4f985cde477b5e7d2a000ec8': 'Theory of Mind: Comparison with self-awareness', '4f99ba82477b5e7d2a0014c6': 'Theory of Mind: fMRI', '4f99bb49477b5e7d2a001535': 'Theory of Mind: fMRI', '4f99cbc6477b5e7d2a00183d': 'TPJ: Mental states or false stories?', '4f99ccd8477b5e7d2a001848': 'Theory of Mind: Temporo-parietal junction', '4f9a326a477b5e7d2a001ae5': 'Theory of Mind: Additional regions', '4f9667ad8222299f190038d9': 'The Importance of Social Cognition', '4f9aed4c477b5e7d2a001c51': 'Language elements: Speech units', '4f9aef30477b5e7d2a001c5d': 'Language elements: Speech structure', '4f9aea26477b5e7d2a001c2f': 'Language and communication', '4f9af45e477b5e7d2a001c7c': 'Language Structure', '4f96fae5477b5e7d2a000092': 'Self-awareness: Testing', '4f9706ef477b5e7d2a00011e': 'Theory of Mind: Attributing Mental States', '4f8da71ee7c1e3251700004f': 'Theory of Mind: Testing', '4f9e340f2a198b3138000dab': 'Language Lateralization', '4f9e39ec2a198b3138000dc5': 'Language Lateralization: Wada test', '4f9ece702a198b3138000e85': 'Language Lateralization: Split-brain', '4f9ed5252a198b3138000ed8': 'Regional Specialization: Broca’s aphasia ', '4f9ed90b2a198b3138000ee9': 'Regional Specialization: Wernicke’s aphasia ', '4f9edb7d2a198b3138000f03': 'Lateralization & Specialization Summary ', '4f9ee6592a198b3138000f68': 'Neural Basis', '4fa04e9d65d886154400032a': 'Neural Basis', '4f9eed3e2a198b3138000fc4': 'Written Word Processing ', '4f9ef2702a198b3138001008': 'Written Word Processing: VWFA ', '4f9ef7d82a198b31380010a5': 'VWFA: Why left lateralized?', '4fa0300f65d8861544000096': 'Three Models', '4fa0314865d88615440000c6': 'Three Models', '4f9efc3c2a198b31380010c4': 'Modeling Speech Processing', '4fa031cb65d88615440000dd': 'Cognitive Map Theory', '4f9f023a2a198b3138001117': 'Modeling Speech Processing: Dual streams ', '4fa032a765d88615440000f0': 'Standard Consolidation Theory', '4fa0334865d8861544000101': 'Multiple Trace Theory', '4fa0342f65d886154400012e': 'SC vs MTT', '4fa0350165d886154400015d': 'SC vs MTT', '4fa0353f65d886154400016a': 'SC vs MTT', '4fa0356265d8861544000176': 'SC vs MTT', '4fa0356465d8861544000177': 'SC vs MTT', '4fa0360765d8861544000195': 'Suzuki Position', '4f9f03d22a198b3138001132': 'Measuring Meaning ', '4f9f06872a198b3138001174': 'Measuring meaning: EEG & ERPs ', '4fa0367065d88615440001a1': 'Baxter Position', '4fa0373b65d88615440001ba': 'Hippocampus and DNMS', '4fa0377465d88615440001c6': 'Hippocampus and DNMS', '4f9f09cf2a198b31380011f1': 'Measuring meaning: ERP characteristics ', '4fa0380865d88615440001da': 'No Delay Needed', '4fa0383865d88615440001dd': 'No Delay Needed', '4f9f0d932a198b313800123f': 'Measuring meaning: ERPs in practice', '4fa038f865d88615440001f3': 'Oddity Tasks', '4fa0393f65d88615440001f8': 'Feature Ambiguity', '4f9f10252a198b3138001257': 'Semantic relatedness and the N400', '4fa08b9965d88615440010c3': 'Patient Studies', '4fa08c2865d88615440010cb': 'Patient Studies', '4fa08c9865d88615440010cf': 'Patient Studies', '4f9f19fc2a198b3138001323': 'N400 scope', '4f9f1ba12a198b313800134b': 'N400 anatomical localization', '4fa08f8365d88615440010e2': 'Suzuki & Baxter Overview', '4fa0918b65d88615440010ef': 'Clive Wearing', '4f9f815d2a198b3138001b80': 'Behavioral studies of aging', '4f9f8b4d2a198b3138001ca6': 'Behavioral studies of aging: SLS', '4f9f8c3d2a198b3138001cc2': 'Behavioral studies of aging: SLS', '4f9f8c762a198b3138001cc5': 'Behavioral studies of aging: SLS', '4fa032f765d88615440000fa': 'SLS: Difference vs. change ', '4fa037bb65d88615440001d0': 'SLS: Interventions ', '4fa03ba965d8861544000220': 'Age-related brain differences: Animal models', '4fa04b0e65d88615440002ec': 'Age-related brain differences: People', '4fa04e8265d8861544000325': 'Age-related brain differences: Structure', '4fa0505265d8861544000350': 'Age-related brain differences: DTI', '4fa0540965d88615440004a6': 'Age-related brain differences: White matter integrity', '4fa057e965d88615440006fe': 'Age-related brain differences: Function', '4fa05a7165d88615440008a6': 'Interventions: Mental exercises', '4fa05ba665d886154400094f': 'Interventions: Aerobic fitness' }

    class ProbeView extends baseviews.BaseView
        
        events:
            "click #feedbut" : "showFeedback"
        
        render: =>
            if not @model then return
            nuggettitle = @parent.options.notclaiming and @model.parent?.model?.get('title') or probe_nugget_title[@model.id] or ""
            console.log nuggettitle
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
    
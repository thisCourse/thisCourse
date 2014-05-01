define ["cs!base/views", "cs!./models", "cs!page/views", "cs!content/items/views", "cs!ui/dialogs/views", "cs!probe/views", "hb!./templates.handlebars", "cs!./hardcode", "less!./styles"], \
        (baseviews, models, pageviews, itemviews, dialogviews, probeviews, templates, hardcode, styles) ->

    class StudyRouterView extends baseviews.RouterView

        routes: =>
            "": => view: LectureListView, datasource: "collection", nonpersistent: true
            ":nugget_id/": (nugget_id) => view: NuggetView, datasource: "collection", key: nugget_id # TODO: here for legacy purposes only
            "lecture/:lecture_id/": (lecture_id) => view: LectureView, datasource: "collection", lecture: lecture_id, nonpersistent: true

        initialize: ->
            # console.log "StudyRouterView init"
            super

    class NuggetRouterView extends baseviews.RouterView

        routes: =>
            "": => view: NuggetListView, datasource: "collection", nonpersistent: true
            ":nugget_id/": (nugget_id) => view: NuggetView, datasource: "collection", key: nugget_id
            "quiz/take/": => view: probeviews.QuizView, datasource: "collection", nonpersistent: true, notclaiming: true
            "test/": => view: probeviews.QuizView, datasource: "collection", nonpersistent: true, notclaiming: true, nofeedback: true

        initialize: ->
            # console.log "NuggetRouterView init"
            super

    class NuggetListView extends baseviews.BaseView

        events:
            "click .add-button": "addNewNugget"
            "click .del-button": "deleteNugget"
            "click .nugget-select": "nuggetPresent"
            "click .draft-button": "draftNugget"
            "click .publish-button":"publishNugget"
            "click .selectAll-button":"selectAllNuggets"
            "click .selectNone-button":"unselectNuggets"
        render: =>
            @filteredcollection = @collection.selectNuggets(@query)
            for nugget in @filteredcollection.models
                if require('app').get('userstatus')?.get('claimed')?.get(nugget.id)
                    nugget.status = 'claimed'
                else if require('app').get('userstatus')?.get('partial')?.get(nugget.id)
                    nugget.status = 'partial'
                else
                    nugget.status = 'unclaimed'
            @$el.html templates.nugget_list collection: @filteredcollection
            @makeSortable()
            @add_subview "tagselectorview", new TagSelectorView(collection: @filteredcollection), ".tagselectorview"
            
        initialize: ->
            # console.log "init NuggetListView"
            @nuggetsChecked = new Backbone.Collection
            require('app').bind "nuggetAnalyticsChanged", @render
            @collection.bind "change", @render
            @collection.bind "remove", @render
            @collection.bind "add", _.debounce @render, 50 # TODO: this gets fired a kazillion times!

        navigate: (fragment, query) =>
            if not _.isEqual query, @query then _.defer @render # re-render the view if the query changed
            super
            
        addNewNugget: =>
            dialogviews.dialog_request_response "Please enter a title:", (title) =>
                @collection.create title: title

        nuggetPresent: (ev) =>
            nugget = @collection.get(ev.target.value)
            if nugget in @nuggetsChecked.models
                @nuggetsChecked.remove nugget
            else 
                @nuggetsChecked.add nugget
                
        deleteNugget: (ev) =>
            if @nuggetsChecked.length
                dialogviews.delete_confirmation @nuggetsChecked, "#{@nuggetsChecked.models.length} nuggets", =>
                for model in @nuggetsChecked.models
                    @collection.remove model
                @nuggetsChecked = new Backbone.Collection
                
        draftNugget: (ev) =>
            if @nuggetsChecked.length
                for model in @nuggetsChecked.models
                    model.set "draft" : true
                    model.save()
                @nuggetsChecked = new Backbone.Collection
            
        publishNugget: (ev) =>
            if @nuggetsChecked.length
                for model in @nuggetsChecked.models
                    model.set "draft" : false
                    model.save()
                @nuggetsChecked = new Backbone.Collection
        
        unselectNuggets: (ev) =>
            @nuggetsChecked = new Backbone.Collection
            $("input[type=checkbox]").removeAttr("checked")
            
        selectAllNuggets: (ev) =>
            @nuggetsChecked = new Backbone.Collection(@filteredcollection.models)    
            @$("input[type=checkbox]").attr("checked", "checked")
        # nuggetAdded: (model, coll) =>
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

    class TagSelectorView extends baseviews.BaseView
        
        initialize: =>
            
        
        render: =>
            @taglist = []
            tags = {}
            if @query
                @claimfilter = @claimedUrl()
                for nugget in @collection.models
                    for tag in (nugget.get('tags') or [])
                        if tag
                            tags[tag.trim().toLowerCase()] = if tag.trim().toLowerCase() of tags then (nugget.get("draft") and tags[tag.trim().toLowerCase()]) else nugget.get("draft")
                if @query.tags        
                    for tag in (decodeURIComponent(@query.tags) or '').split(';')
                        if tag
                            tags[tag.trim().toLowerCase()] = false
                for tag, value of tags
                    if tag in (decodeURIComponent(@query.tags) or '').split(';')
                        @taglist.push tagname: tag, selected: true, url: @tagUrl(tag,true), draft: value
                    else
                        @taglist.push tagname: tag, url: @tagUrl(tag,false), draft: value
            @taglist = _.sortBy @taglist, (obj) -> obj.tagname
            @quiz = @quizUrl('quiz/take/')
            @test = @quizUrl('test/')
            @$el.html templates.tag_selector @context(@taglist,@claimfilter,@quiz)
            
        claimedUrl: () =>
            tags = if @query.tags then 'tags='+@query.tags else ''
            all = text: 'All',selected: not (@query.claimed or @query.ripe!=undefined), url: if tags then @url + '?' + tags else @url
            ripe = text: 'Ready to Review', selected: @query.ripe!=undefined, url: if tags then @url + '?' + tags + '&' + 'ripe=1' else @url + '?' + 'ripe=1'
            claimed = text: 'Claimed',selected: @query.claimed=='1', url: if tags then @url + '?' + tags + '&' + 'claimed=1' else @url + '?' + 'claimed=1'
            unclaimed = text: 'Unclaimed',selected: @query.claimed=='0', url: if tags then @url + '?' + tags + '&' + 'claimed=0' else @url + '?' + 'claimed=0'
            claimfilter = [all,ripe, claimed,unclaimed]
        
        tagUrl: (tagname,selected) =>
            taglist = if @query.tags then (tag for tag in decodeURIComponent(@query.tags).split(';')) else []
            if selected
                taglist = _.without(taglist,encodeURIComponent(tagname))
            else
                taglist.push tagname
            tags = if taglist.join(';') then taglist.join(';') else ''
            params = {}
            if @query.claimed then params['claimed'] = @query.claimed
            if tags then params['tags']  = tags
            if @query.ripe then params['ripe'] = @query.ripe
            url = @url + '?' + $.param(params)
            
        quizUrl: (quiz) =>
            params = {}
            if @query.claimed then params['claimed'] = @query.claimed
            if @query.tags then params['tags']  = @query.tags
            if @query.ripe then params['ripe'] = @query.ripe
            quizUrl = url: @url + quiz + '?' + $.param(params)
    
    class LectureListView extends baseviews.RouterView

        events:
            "click .theme": "highlight"
                
        routes: =>
            "lecture/:lecture_id/": (lecture_id) => view: LectureView, datasource: "collection", lecture: lecture_id
            
        render: =>
            themes = _.uniq(_.flatten(theme for theme in lect.tags for lecture, lect of hardcode.knowledgestructure))
            @lecturelist = 
                lecture:{title: lect.title, lecture: lecture,points:0,status:'unclaimed',minpoints:lect.minpoints, draft: lect.draft, themes: lect.tags} for lecture, lect of hardcode.knowledgestructure
                totalpoints: 0
                theme: ({theme_id: theme, theme_name: theme.replace(/-/g," ")} for theme in themes)
            if require('app').get('userstatus')
                require('app').get('userstatus').getKeyWhenReady 'claimed', (claimed) =>
                    @annotate(claimed)
            else
                @annotate models:[]

        annotate: (claimed) =>
            relec = new RegExp('(L[0-9]+)')
            require('app').get("course").whenLoaded =>
                for lecture in @lecturelist.lecture
                    lecture.points = 0
                    lecture.status = 'unclaimed'
                for nuggetitem in claimed.models
                    lec = ''
                    for tag in require('app').get('course').get('nuggets').get(nuggetitem.id)?.get('tags') or []
                        lec = relec.exec(tag)?[0] or lec
                    if not lec then continue
                    _.find(@lecturelist.lecture, (lect) -> lect.lecture==lec)?.points += nuggetitem.get('points')
                @lecturelist.totalpoints = 0
                for lecture in @lecturelist.lecture
                    @lecturelist.totalpoints += lecture.points
                    if lecture.points >= lecture.minpoints then lecture.status = 'claimed'
                @$el.html templates.nugget_lecture_list @context(@lecturelist)
                    
        initialize: =>
            require('app').bind "nuggetAnalyticsChanged", @render
            
        
        highlight: (ev) =>
            theme = ev.target.id
            checked = @$("#" + theme).hasClass("highlight")
            @$(".theme, .lecture").removeClass("highlight")
            @$(".lecture").removeClass("lowlight")
            if not checked
                @$("." + theme).addClass("highlight")
                @$("#" + theme).addClass("highlight")
                @$(".lecture").addClass("lowlight")

        clusterView: (ev) =>
            lecture = ev.target.id
            @$(".view").toggleClass('hidden')
            @lecturecollection = @collection.filter (model) => 
                lecture in (model.get('tags') or [])
            clustercollection = hardcode.knowledgestructure[lecture]
            # console.log hardcode.knowledgestructure
            # console.log clustercollection
            @add_subview "clusterview", new NuggetSpaceClusterView(collection: @lecturecollection, clusters: clustercollection), ".clusterview"    
                
    class LectureView extends baseviews.BaseView
        
        render: =>
            html = "<h2>Lecture #{Number(@options.lecture.slice(1))}: #{hardcode.knowledgestructure[@options.lecture].title}</h2><b>Claimed</b><span class = 'claimed'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><b>Partial</b><span class = 'partial'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>"
            @$el.html html + "<div class='navigation pagination'></div><div class='body'></div>"
            @add_subview "top", new ClusterListView(lecture: @options.lecture), ".navigation"
            @add_subview "bottom", new LectureBottomView(collection: @collection, lecture: @options.lecture), ".body"
    
    class ClusterListView extends baseviews.NavRouterView
        
        className: "nav"
        
        pattern: "cluster/:cluster_id/"
        
        initialize: ->
            for id, name of hardcode.knowledgestructure[@options.lecture].clusters
                @addItem id, name
    
    class LectureBottomView extends baseviews.RouterView
        
        routes: =>
            "cluster/:cluster_id/": (cluster_id) => view: FilteredNuggetListView, datasource: "collection", cluster: cluster_id, lecture: @options.lecture, nonpersistent: true

    class FilteredNuggetListView extends baseviews.BaseView
        
        initialize: =>
            @collection.bind "add", @render # TODO: this is going to be called a LOT
            require('app').bind "nuggetAnalyticsChanged", @render
        
        render: =>
            # @$el.html "Nuggs: " + @collection.length + " " + @options.lecture + " " + @options.cluster
            nuggetlist = nuggets: @collection.selectNuggets(tags: @options.lecture+";"+@options.cluster).models #Fix to allow lecture tags with spaces in
            # nuggetlist = nuggets: @collection.models.filter (nugget) =>
            #          if not nugget.attributes.tags then return false
            #          @options.cluster in nugget.attributes.tags and @options.lecture in nugget.attributes.tags
            nuggetlist.nuggets = _.sortBy nuggetlist.nuggets, (nugget) ->
                nug = ''
                renug = new RegExp('N([0-9]+)')
                for tag in nugget.attributes.tags
                    nug = renug.exec(tag)?[1] or nug
                Number(nug)
            for nugget in nuggetlist.nuggets
                if require('app').get('userstatus')?.get('claimed')?.get(nugget.id)
                    nugget.status = 'claimed'
                else if require('app').get('userstatus')?.get('partial')?.get(nugget.id)
                    nugget.status = 'partial'
                else
                    nugget.status = 'unclaimed'
            @$el.html templates.filtered_nugget_list nuggetlist

        navigate: ->
            #HACK: To fix failure to render
            @render()
            super

    # class NuggetLectureTestView extends baseviews.BaseView
            
    #     render: =>
    #         @$el.html "<div class='navigation'></div><div class='body'></div>"
    #         @add_subview "nav", new NuggetLectureNavRouterView, ".navigation"
    #         @add_subview "body", new NuggetTestRouterView, ".body"
    #         @subviews.nav.addItem "", "Home"
    #         @subviews.nav.addItem "hello"
    #         @subviews.nav.addItem "bye"
                
    # class NuggetLectureNavRouterView extends baseviews.NavRouterView
        
    #     pattern: ":lecture_id/"
    
    # class NuggetTestRouterView extends baseviews.RouterView
        
    #     routes: =>
    #         "": (lecture_id) => view: NuggetTestView, lecture: "Home"
    #         ":lecture_id/": (lecture_id) => view: NuggetTestView, lecture: lecture_id
        
    # class NuggetTestView extends baseviews.BaseView
        
    #     render: =>
    #         @$el.html "I am lecture '#{@options.lecture}'."

    doPost = (url, data, success) ->
        $.ajax
            type: 'POST'
            url: url
            data: JSON.stringify(data)
            success: success
            contentType: 'application/json'

    class ProbeToggleEnableView extends baseviews.BaseView
        
        events:
            "click .unclaim": "unClaim"
        
        initialize: ->
            require('app').bind "nuggetAnalyticsChanged", @render
        
        render: =>
            @$el.html templates.probe_enable @context
                claimed: require('app').get('userstatus')?.get('claimed')?.get(@model.id),
                partial: require('app').get('userstatus')?.get('partial')?.get(@model.id),
                unclaimed: require('app').get('userstatus')?.get('unclaimed')?.get(@model.id),
            
        unClaim: =>
            dialogviews.dialog_confirmation "Unclaim Nugget","Do you really want to Unclaim this Nugget? (you will need to take the quiz again if you want to reclaim it later)", =>
                nuggetattempt = unclaimed: true, nugget: @parent.model.id
                doPost '/analytics/nuggetattempt/', nuggetattempt, (data) =>
                    require('app').updateUserStatus(data)
            , confirm_button:"Unclaim", cancel_button:"Cancel"

    class ProbeToggleRouterView extends baseviews.RouterView
        
        routes: =>
            "": => view: ProbeToggleEnableView, datasource: "model", nonpersistent: true
            "quiz/take/": => view: ProbeExitQuizView, template: templates.probe_disable
            "quiz/edit/": => view: baseviews.GenericTemplateView, template: templates.probe_edit_disable
            # TODO: Make the URL reference for the exit quiz in probe_disable more robust.


    class ProbeExitQuizView extends baseviews.GenericTemplateView

        events:
            "click #exit_quiz" : "exitQuiz"

        exitQuiz: ->
            require('app').trigger "exitQuiz"

    class NuggetView extends baseviews.BaseView

        render: =>
            @$el.html templates.nugget @context()
            @add_subview "topview", new NuggetTopView(model: @model), ".nugget-top"
            @add_subview "bottomview", new NuggetBottomRouterView(model: @model), '.nugget-bottom'

        edit: =>
            @subviews.topview.hide()
            @add_subview "topeditview", new NuggetTopEditView(model: @model), ".nugget-top"
        
        editDone: =>
            @close_subview "topeditview"
            @subviews.topview.show()
            
    class NuggetBottomRouterView extends baseviews.RouterView
        
        routes: =>
            "": => name: "pageview", view: pageviews.PageView, datasource: "model", key: "page"
            "quiz/take/": => view: probeviews.ProbeRouterView, datasource: "model", key: "probeset", nonpersistent: true, examquestions: @examquestions
            "quiz/edit/": => view: probeviews.ProbeEditRouterView, datasource: "model", nonpersistent: true

        initialize: ->
            @examquestions = @model.get("examquestions")
            # console.log "NuggetBottomRouterView init"
            super

    class NuggetTopView extends baseviews.BaseView
        
        Handlebars.registerHelper ('navlink'), (tags) ->
            if not _.isArray(tags) then return ""
            relec = new RegExp('L([0-9]+)')
            reclus = new RegExp('C([0-9]+)')
            for tag in tags
                lec = relec.exec(tag) or lec
                clus = reclus.exec(tag) or clus
            if not lec or not clus then return ''
            return "<a href='"+@url+"../../study/lecture/"+lec[0]+"/cluster/"+clus[0]+"/'>Return to Lecture "+Number(lec[1])+" Cluster "+Number(clus[1])+"</a>"

        Handlebars.registerHelper ('comma_join'), (tags) -> _.isArray(tags) and tags.join?(",") or ""
        
        initialize: ->
            @model.bind "change", @render

        events: => _.extend super,
            "click .edit-button": "edit"
            "click .draft":"makeDraft"
            "click .publishIt":"publish"
        
        render: =>
            @$el.html templates.nugget_top @context()
            @add_subview "probetoggle", new ProbeToggleRouterView(model: @model), ".probetoggle"
            @bind_data()

        edit: =>
            @parent.edit()
            
        makeDraft: =>
            @model.set "draft": true
            @model.save()
            
        publish: =>
            @model.set "draft": false
            @model.save()
            
    class NuggetTopEditView extends baseviews.BaseView

        initialize: ->
            @mementoStore()
        
        render: =>
            @$el.html templates.nugget_top_edit @context()
            Backbone.ModelBinding.bind @
            @enablePlaceholders()

        events: #-> _.extend super,
            "click button.save": "save"
            "click button.cancel": "cancel"

        save: =>
            @$("input").blur()
            @$(".save.btn").button "loading"
            if _.isString(@model.get("tags")) then @model.set tags: @model.get("tags").split(",")
            @model.save().success =>
                # @parent.render()
                @parent.editDone()

        cancel: =>
            @mementoRestore()
            @parent.editDone()

            
    StudyRouterView: StudyRouterView
    NuggetRouterView: NuggetRouterView
    NuggetListView: NuggetListView
    NuggetView: NuggetView
    NuggetTopView: NuggetTopView
    NuggetTopEditView: NuggetTopEditView
    
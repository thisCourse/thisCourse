define ["cs!base/views", "cs!./models", "cs!page/views", "cs!content/items/views", "cs!ui/dialogs/views", "cs!probe/views", "hb!./templates.handlebars", "cs!./hardcode", "less!./styles"], \
        (baseviews, models, pageviews, itemviews, dialogviews, probeviews, templates, hardcode, styles) ->

    refreshNuggetAnalytics = =>
        $.get '/analytics/nuggetattempt/', (nuggetattempt) =>
            partial = nuggetattempt.attempted
            claimed = nuggetattempt.claimed
            
            require('app').get('user').set claimed: new Backbone.Collection(claimed), partial: new Backbone.Collection(partial)
            require('app').trigger "nuggetAnalyticsChanged" # TODO: hackish

    refreshNuggetAnalytics()

    _.defer => require("app").bind "loginChanged", refreshNuggetAnalytics

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
            "quiz/": => view: probeviews.ProbeRouterView, datasource: "collection", nonpersistent: true, notclaiming: true
            "test/": => view: probeviews.ProbeRouterView, datasource: "collection", nonpersistent: true, notclaiming: true, nofeedback: true

        initialize: ->
            # console.log "NuggetRouterView init"
            super

    class NuggetListView extends baseviews.BaseView

        events:
            "click .add-button": "addNewNugget"
            "click .delete-button": "deleteNugget"

        render: =>
            @filteredcollection = @collection.select(@query)
            @$el.html templates.nugget_list collection: @filteredcollection
            @makeSortable()
            @add_subview "tagselectorview", new TagSelectorView(collection: @filteredcollection), ".tagselectorview"
            
        initialize: ->
            # console.log "init NuggetListView"
            @collection.bind "change", @render
            @collection.bind "remove", @render
            @collection.bind "add", _.debounce @render, 50 # TODO: this gets fired a kazillion times!

        navigate: (fragment, query) =>
            if not _.isEqual query, @query then _.defer @render # re-render the view if the query changed
            super
            
        addNewNugget: =>
            dialogviews.dialog_request_response "Please enter a title:", (title) =>
                @collection.create title: title

        deleteNugget: (ev) =>
            nugget = @collection.get(ev.target.id)
            dialogviews.delete_confirmation nugget, "nugget", =>
                @collection.remove nugget

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
            tags = []
            if @query
                @claimfilter = @claimedUrl()
                for nugget in @collection.models
                    for tag in (nugget.get('tags') or [])
                        tags.push tag.trim().toLowerCase()
                tags = _.uniq(tags)
                tags.sort()
                for tag in tags
                    if tag in (decodeURIComponent(@query.tags) or '').split(';')
                        @taglist.push tagname: tag, selected: true, url: @tagUrl(tag,true)
                    else
                        @taglist.push tagname: tag, url: @tagUrl(tag,false)
            @quiz = @quizUrl('quiz/')
            @test = @quizUrl('test/')
            @$el.html templates.tag_selector @context(@taglist,@claimfilter,@quiz)
            
        claimedUrl: () =>
            tags = if @query.tags then 'tags='+@query.tags else ''
            all = text: 'All',selected: not @query.claimed, url: if tags then @url + '?' + tags else @url
            claimed = text: 'Claimed',selected: @query.claimed=='1', url: if tags then @url + '?' + tags + '&' + 'claimed=1' else @url + '?' + 'claimed=1'
            unclaimed = text: 'Unclaimed',selected: @query.claimed=='0', url: if tags then @url + '?' + tags + '&' + 'claimed=0' else @url + '?' + 'claimed=0'
            claimfilter = [all,claimed,unclaimed]
        
        tagUrl: (tagname,selected) =>
            claimed = if @query.claimed then 'claimed='+@query.claimed else ''
            taglist = if @query.tags then (tag for tag in @query.tags.split(';')) else []
            if selected
                taglist = _.without(taglist,encodeURIComponent(tagname))
            else
                taglist.push tagname
            tags = if taglist.join(';') then 'tags='+taglist.join(';') else ''
            url = if tags then @url + '?' + tags + (if claimed then '&' + claimed else '') else @url + (if claimed then '?' + claimed else '')
            
        quizUrl: (quiz) =>
            claimed = if @query.claimed then 'claimed='+@query.claimed else ''
            tags = if @query.tags then 'tags='+@query.tags else ''
            quizUrl = url: if tags then @url + quiz + '?' + tags + (if claimed then '&' + claimed else '') else @url + quiz + (if claimed then '?' + claimed else '')
    
    class LectureListView extends baseviews.RouterView
                
        routes: =>
            "lecture/:lecture_id/": (lecture_id) => view: LectureView, datasource: "collection", lecture: lecture_id
            
        render: =>
            @$el.html templates.nugget_lecture_list @context(@lecturelist)
            @lecturelist = {lecture:{title: lect.title, lecture: lecture,points:0,status:'unclaimed',minpoints:lect.minpoints} for lecture, lect of hardcode.knowledgestructure,totalpoints: 0}                
            relec = new RegExp('(L[0-9]+)')
            require('app').get('user').getKeyWhenReady 'claimed', (claimed) =>
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
            
        
        clusterView: (ev) =>
            lecture = ev.target.id
            @$(".view").toggleClass('hidden')
            @lecturecollection = @collection.filter (model) => 
                lecture in (model.get('tags') or [])
            clustercollection = hardcode.knowledgestructure[lecture]
            console.log hardcode.knowledgestructure
            console.log clustercollection
            @add_subview "clusterview", new NuggetSpaceClusterView(collection: @lecturecollection, clusters: clustercollection), ".clusterview"    
                
    class LectureView extends baseviews.BaseView
        
        render: =>
            html = "<h2>Lecture #{Number(@options.lecture.slice(1))}: #{hardcode.knowledgestructure[@options.lecture].title}</h2>"
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
            #alert "waaaaa"
            # @$el.html "Nuggs: " + @collection.length + " " + @options.lecture + " " + @options.cluster
            nuggetlist = nuggets: @collection.models.filter (nugget) =>
                     if not nugget.attributes.tags then return false
                     @options.cluster in nugget.attributes.tags and @options.lecture in nugget.attributes.tags
            nuggetlist.nuggets = _.sortBy nuggetlist.nuggets, (nugget) ->
                nug=''
                renug = new RegExp('N([0-9]+)')
                for tag in nugget.attributes.tags
                    nug = renug.exec(tag)?[1] or nug
                Number(nug)
            for nugget in nuggetlist.nuggets
                if require('app').get('user').get('claimed')?.get(nugget.id)
                    nugget.status = 'claimed'
                else if require('app').get('user').get('partial')?.get(nugget.id)
                    nugget.status = 'partial'
                else
                    nugget.status = 'unclaimed'
            @$el.html templates.filtered_nugget_list nuggetlist

    




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
            @$el.html templates.probe_enable @context(status:require('app').get('user').get('claimed')?.get(@model.id))
            
        unClaim: =>
            dialogviews.dialog_confirmation "Unclaim Nugget","Do you really want to Unclaim this Nugget? (you will need to take the quiz again if you want to reclaim it later)", =>
                nuggetattempt = unclaimed: true, nugget: @parent.model.id
                doPost '/analytics/nuggetattempt/', nuggetattempt, refreshNuggetAnalytics
            , confirm_button:"Unclaim", cancel_button:"Cancel"

    class ProbeToggleRouterView extends baseviews.RouterView
        
        routes: =>
            "": => view: ProbeToggleEnableView, datasource: "model", nonpersistent: true
            "quiz/": => view: baseviews.GenericTemplateView, template: templates.probe_disable

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
            "quiz/": => view: probeviews.ProbeRouterView, datasource: "model", key: "probeset", nonpersistent: true


        initialize: ->
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
            # @model.bind "change", @render

        events: => _.extend super,
            "click .edit-button": "edit"
        
        render: =>
            @$el.html templates.nugget_top @context()
            @add_subview "probetoggle", new ProbeToggleRouterView(model: @model), ".probetoggle"
            @bind_data()

        edit: =>
            @parent.edit()

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
    
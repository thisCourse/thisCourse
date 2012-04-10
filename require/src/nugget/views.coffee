define ["cs!base/views", "cs!./models", "cs!page/views", "cs!content/items/views", "cs!ui/dialogs/views", "cs!probe/views", "hb!./templates.handlebars", "cs!./hardcode", "less!./styles"], \
        (baseviews, models, pageviews, itemviews, dialogviews, probeviews, templates, hardcode, styles) ->

    class NuggetRouterView extends baseviews.RouterView

        routes: =>
            #"": => view: LectureListView, datasource: "collection"
            "": => view: LectureListView, datasource: "collection"
            ":nugget_id/": (nugget_id) => view: NuggetView, datasource: "collection", key: nugget_id
            "lecture/:lecture_id/": (lecture_id) => view: LectureView, datasource: "collection", lecture: lecture_id

        initialize: ->
            console.log "NuggetRouterView init"
            super

    class NuggetListView extends baseviews.BaseView

        events:
            "click .add-button": "addNewNugget"
            "click .delete-button": "addNewNugget"

        render: =>
            # console.log "rendering NuggetListView"
            @$el.html templates.nugget_list @context()
            @makeSortable()
            
        initialize: ->
            # console.log "init NuggetListView"
            @collection.bind "change", @render
            @collection.bind "remove", @render
            @collection.bind "add", @render
            @render()            

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

    class LectureListView extends baseviews.RouterView
        
        routes: =>
            "lecture/:lecture_id/": (lecture_id) => view: LectureView, datasource: "collection", lecture: lecture_id
            
        render: =>
            @$el.html templates.nugget_lecture_list @context(@lecturelist)
            
        initialize: =>
            @lecturelist = {lecture:({title: lect.title, lecture: lecture,points:0,status:'unclaimed'} for lecture, lect of hardcode.knowledgestructure)}
            console.log @lecturelist                  
            @render
        
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
            "cluster/:cluster_id/": (cluster_id) => view: FilteredNuggetListView, datasource: "collection", cluster: cluster_id, lecture: @options.lecture

    class FilteredNuggetListView extends baseviews.BaseView
        
        initialize: =>
            @collection.bind "add", @render # TODO: this is going to be called a LOT
        
        render: =>
            #alert "waaaaa"
            # @$el.html "Nuggs: " + @collection.length + " " + @options.lecture + " " + @options.cluster
            @$el.html templates.filtered_nugget_list
                  nuggets: @collection.models.filter (nugget) =>
                     if not nugget.attributes.tags then return false
                     @options.cluster in nugget.attributes.tags and @options.lecture in nugget.attributes.tags

    




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





    class NuggetView extends baseviews.BaseView

        events:
            "click .edit-button": "edit"

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
            "quiz/": => view: probeviews.ProbeContainerView, datasource: "model", key: "probeset"

        initialize: ->
            console.log "NuggetBottomRouterView init"
            super

    class NuggetTopView extends baseviews.BaseView
        
        Handlebars.registerHelper ('navlink'), (tags) ->
            relec = new RegExp('L([0-9]+)')
            reclus = new RegExp('C([0-9]+)')
            for tag in tags
                lec = relec.exec(tag) or lec
                clus = reclus.exec(tag) or clus
            out = "<a href='"+@url+"../lecture/"+lec[0]+"/cluster/"+clus[0]+"/'>Return to Lecture "+Number(lec[1])+" Cluster "+Number(clus[1])+"</a>"
        
        initialize: -> @render()

        events: => _.extend super,
            "click .edit-button": "edit"
        
        render: =>
            @$el.html templates.nugget_top @context()
            Backbone.ModelBinding.bind @

        edit: =>
            @parent.edit()

    class NuggetTopEditView extends baseviews.BaseView

        initialize: ->
            @mementoStore()
            @render()
        
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
            @model.save().success =>
                @parent.render()
                @parent.editDone()

        cancel: =>
            @mementoRestore()
            @parent.editDone()

            
    NuggetRouterView: NuggetRouterView
    NuggetListView: NuggetListView
    NuggetView: NuggetView
    NuggetTopView: NuggetTopView
    NuggetTopEditView: NuggetTopEditView
    
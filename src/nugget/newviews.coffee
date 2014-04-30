define ["cs!base/views", "cs!./models", "cs!page/views", "cs!content/items/views", "cs!ui/dialogs/views", "cs!probe/views", "hb!./templates.handlebars", "cs!./hardcode", "less!./styles"], \
        (baseviews, models, pageviews, itemviews, dialogviews, probeviews, templates, hardcode, styles) ->

    class NuggetRouterView extends baseviews.RouterView

        routes: =>
            "": => view: LectureListView, datasource: "collection"
            "list/": => view: NuggetListView, datasource: "collection"
            ":nugget_id/": (nugget_id) => view: NuggetView, datasource: "collection", key: nugget_id
            "lecture/:lectureid": (lectureid) => view: LectureView, datasource: "collection", key: lectureid

        initialize: ->
            console.log "NuggetRouterView init"
            super

    class NuggetListView extends baseviews.BaseView

        events:
            "click .add-button": "addNewNugget"
            "click .delete-button": "deleteNugget"
            "click .nugget-select": "nuggetPresent"

        render: =>
            # console.log "rendering NuggetListView"
            @$el.html templates.nugget_list @context()
            @makeSortable()
            
        initialize: ->
            @nuggetsToDraft = new Backbone.Collection
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
            
        nuggetPresent: (ev) =>
            nugget = @collection.get(ev.target.value)
            if nugget in @nuggetsToDraft.models
                @nuggetsToDraft.remove nugget
            else 
                @nuggetsToDraft.add nugget
            

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
            
    class NuggetLectureRouterView extends baseviews.RouterView
            
        
        render: =>
            @$el.html templates.nugget_space @context(@lecturelist)

            
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
                
                
    class NuggetLectureView extends baseviews.RouterView
    
    
    class NuggetSpaceClusterView extends baseviews.BaseView
        
        events:
            "click .lecturelink" : "lectureView"        
        
        render: =>
            @$el.html templates.nugget_space_cluster @context(@clusterlist)
            @$('#C01').addClass('active')
            
        initialize: =>
            @clusterlist = {cluster:({title: title, cluster: cluster} for cluster, title of @options.clusters.clusters)}
            for cluster in @clusterlist.cluster
                nuggetcollection = @collection.filter (model) => 
                    cluster.cluster in (model.get('tags') or [])
                cluster.nugget = nuggetcollection
            @render
            
        lectureView: (ev) =>
            lecture = ev.target.id
            @$el.toggleClass('hidden')
            @parent.$(".view").toggleClass('hidden')
            

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
            "quiz/": => view: probeviews.ProbeView, datasource: "model", key: "probes"

        initialize: ->
            console.log "NuggetBottomRouterView init"
            super

    class NuggetTopView extends baseviews.BaseView
        
        # initialize: -> @render()

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
            # @render()
        
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
    
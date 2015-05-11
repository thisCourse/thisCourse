define ["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles", "cs!../userstatus/models", "cs!ui/spinner/views"], \
        (baseviews, models, templates, styles, userstatusmodels, spinnerviews) ->

    class UserStatusRouterView extends baseviews.RouterView

        routes: =>
            "": => view: UserStatusListView, datasource: "collection"
            ":user_status_id/": (user_status_id) => view: UserStatusView, datasource: "collection", key: user_status_id


    class UserStatusListView extends baseviews.BaseView
        events:
            "click .usrstatus-select": "selectedUsrStatusColl"
            "click .setExam-button":"setExamMode"
            "click .selectAll-button":"selectAllUsrStatus"
            "click .selectNone-button":"unselectAllUsrStatus"
            "click .toggleShield-button": "toggleShield"
            "click .user-move-button": "moveUser"
        initialize: =>
            @usrStatusChecked = new Backbone.Collection
            @filter = (model.get("_id") for model in @collection.models.slice())
            promises = []
            for model in @collection.models
                promises.push model.fetch()
            $.when.apply($, promises).then @annotate
            @collection.bind "add", _.debounce @render, 50
            @collection.bind "change", @render
            @collection.bind "remove", @render
            if @options.classes
                @classmodel =@options.classmodel

        render: =>
            if @annotated
                if @subviews["spinner"]
                    @subviews["spinner"].hide()
                @$el.html templates.user_status_list @context()
            else
                @$el.html templates.user_status_list @context()
                @add_subview "spinner", new spinnerviews.SpinnerView model: null, ".footer"
                @subviews["spinner"].show()

        annotate: =>
            # console.log @filter
            # console.log @classmodel.get("list")
            # @collection = @classmodel.get("list")
            # @collection.bind "remove", @render
            # # @collection = new models.UserStatusCollection(_.filter(@collection.models, (model) => model.id in @filter))
            # console.log @collection
            @collection.models.forEach (user) ->
                points = _.reduce user.get("claimed").models, ((points, probe) -> if probe.get("points") then return points += probe.get("points") else return points), 0
                user.set "points": points
            @annotated = true
            @render()
        
        selectedUsrStatusColl: (ev) =>
            user = @collection.get(ev.target.value)
            if user in @usrStatusChecked.models
                @usrStatusChecked.remove user
            else 
                @usrStatusChecked.add user
            
        
        setExamMode:(ev) =>
            if @usrStatusChecked.length
                for model in @usrStatusChecked.models
                    model.set "examMode" : @$("#select-exam").val()
                    model.save()
                @usrStatusChecked = new Backbone.Collection
            
        unselectAllUsrStatus: (ev) =>
            @usrStatusChecked = new Backbone.Collection
            $("input[type=checkbox]").removeAttr("checked")
            
        selectAllUsrStatus: (ev) =>
            @usrStatusChecked = new Backbone.Collection(@collection.models)    
            @$("input[type=checkbox]").attr("checked", "checked")
        
        toggleShield: (ev) =>
            if @usrStatusChecked.length
                for model in @usrStatusChecked.models
                    model.set "enabled": not model.get("enabled")
                    model.save()
                @usrStatusChecked = new Backbone.Collection  
                
        moveUser: =>
            console.log "MOVE"
            @usrStatusChecked.length
            if @usrStatusChecked.length
                targetModel = @options.classes.get(@$("#select-class").val())
                for model in @usrStatusChecked.models
                    console.log model
                    @collection.remove model
                    targetModel.get("list").add model
                @classmodel.save()
                targetModel.save()
            @usrStatusChecked = new Backbone.Collection            

    class UserStatusView extends baseviews.BaseView
        
        initialize: =>
            @model.bind "change", @render
        
        render: =>
            if not app.get("userstatus")?.get("enabled")
                @$el.html "<h3 class='btn info' disabled='disabled' style='float:right; margin:5px; padding:5px;'>Shield Disabled</h3>"
                return false
            points = _.reduce @model.get("claimed").models, ((points, nugget) -> if nugget.id.length==24 then points += nugget.get("points") else points), 0
            life = @model.get("life")
            shield = @model.get("shield")
            target = @model.get("target") or 1
            pointscolour = 
                    red: Math.floor(255*(target-points)/target)
                    green: Math.floor(255*Math.min(points,target)/target)
                    blue: 0
            if life!=undefined and shield!=undefined
                liferadius = Math.sqrt(33*life/3.14)
                shieldradius = (liferadius + shield/3) or 1
                shieldstartoffset = 100*liferadius/shieldradius
                shieldendoffset = 200-shieldradius
                startcolour = 
                    red: 255 
                    green: 66
                    blue: 0
                endcolour = 
                    red: Math.floor(startcolour.red - 156*(shield/100))
                    green: Math.floor(startcolour.green + 189*(shield/100))
                    blue: Math.floor(startcolour.blue + 33*(shield/100))
                fontsize = Math.max(10.2,34*(liferadius/Math.sqrt(33*100/3.14)))
                shieldfontsize = 17
                leftX = 80 - shieldradius
                rightX = 80 + shieldradius
                startY = 80 + .5*fontsize
                greaterthan60 = shield > 60
                startshieldtext = 100 - (liferadius + (shieldradius - liferadius)/2)
                startoutershieldtext = 97- shieldradius
                @$el.html templates.user_status @context(
                    startoutershieldtext: startoutershieldtext
                    startshieldtext: startshieldtext
                    liferadius: liferadius
                    shieldradius: shieldradius
                    shieldstartoffset: shieldstartoffset
                    startcolour: startcolour
                    endcolour: endcolour
                    fontsize: fontsize
                    shieldfontsize: shieldfontsize
                    startY: startY
                    leftX: leftX
                    rightX: rightX
                    greaterthan60:greaterthan60
                    points: points
                    pointscolour: pointscolour
                    reached: points >= target
                    )
            else
                return false


    UserStatusRouterView: UserStatusRouterView
    UserStatusListView: UserStatusListView
    UserStatusView: UserStatusView
define ["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles", "cs!../userstatus/models"], \
        (baseviews, models, templates, styles, userstatusmodels) ->

    class UserStatusRouterView extends baseviews.RouterView

        routes: =>
            "": => view: UserStatusListView, datasource: "collection"
            ":user_status_id/": (user_status_id) => view: UserStatusView, datasource: "collection", key: user_status_id


    class UserStatusListView extends baseviews.BaseView

        initialize: =>
            @collection = new userstatusmodels.UserStatusCollection
            @collection.fetch().success @render
            @collection.bind "add", _.debounce @render, 50
            @collection.bind "change", @render
            @collection.bind "loaded", @render


        render: =>
            @$el.html templates.user_status_list @context()
            

    class UserStatusView extends baseviews.BaseView
        
        initialize: =>
            @model.bind "change", @render
        
        render: =>
            life = @model.get("life")
            shield = @model.get("shield")
            if life!=undefined and shield!=undefined
                liferadius = Math.sqrt(33*life/3.14)
                shieldradius = liferadius + shield/3
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
                startshieldtext = 80 - (liferadius + (shieldradius - liferadius)/2)
                startoutershieldtext = 77- shieldradius
                @$el.html templates.user_status @context(startoutershieldtext: startoutershieldtext, startshieldtext: startshieldtext, liferadius: liferadius, shieldradius: shieldradius, shieldstartoffset: shieldstartoffset, startcolour: startcolour, endcolour: endcolour, fontsize: fontsize, shieldfontsize: shieldfontsize, startY: startY, leftX: leftX, rightX: rightX, greaterthan60:greaterthan60)
            else
                return false


    UserStatusRouterView: UserStatusRouterView
    UserStatusListView: UserStatusListView
    UserStatusView: UserStatusView
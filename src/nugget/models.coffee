define ["cs!base/models", "cs!page/models", "cs!probe/models"], (basemodels, pagemodels, probemodels) ->

    class NuggetModel extends basemodels.LazyModel

        relations: ->
            page:
                model: pagemodels.PageModel
                includeInJSON: false
            probeset:
                collection: probemodels.ProbeCollection
                includeInJSON: false
            examquestions:
                collection: probemodels.ProbeCollection
                includeInJSON: false

    class NuggetCollection extends basemodels.LazyCollection

        model: NuggetModel
        
        filterWithIds: (ids) ->
            
            filteredlist = @filter (nugget) =>
                _.indexOf(ids, nugget.id) > -1
            filteredcollection = new Backbone.Collection filteredlist
        
        selectNuggets: (query) ->
            
            if query        
                if query.tags 
                    taglist = (tag.trim().toLowerCase() for tag in decodeURIComponent(query.tags).split(';'))
                else
                    taglist = []
                claimed = query.claimed or ''
                ripecheck = query.ripe or ''
                filteredlist = @filter (nugget) =>
                    switch claimed
                        when '1' then select = 1 if require('app').get('userstatus').get('claimed').get(nugget.id)
                        when '0' then select = 1 if not require('app').get('userstatus').get('claimed').get(nugget.id)
                        else select = 1
                    nuggettags = (tag.trim().toLowerCase() for tag in nugget.get('tags') or [])
                    tagged = if taglist then _.isEqual(_.intersection(nuggettags,taglist).sort(),taglist.sort()) else true
                    
                    ripe = true
                    if ripecheck
                        # console.log require('app').get('userstatus').get('claimed').get(nugget.id)
                        nuggetdata = require('app').get('userstatus').get('claimed').get(nugget.id)
                        if nuggetdata
                            timenow = new Date()
                            console.log nuggetdata
                            if nuggetdata.get("probetimes")
                                if _.every(nuggetdata.get("probetimes"), (time) -> (timenow.getTime() - (new Date(time)).getTime())/1000 < 7*24*60*60)
                                    ripe = false
                            else
                                if (timenow.getTime() - (new Date(nuggetdata.get("timestamp"))).getTime())/1000 < 7*24*60*60
                                    ripe = false
                        else
                            ripe = false
                                                            
                    tagged and select and nugget.get('title') and ripe #HACK to exclude title-less nuggets
            else
                filteredlist = @models
            filteredcollection = new Backbone.Collection filteredlist


    NuggetModel: NuggetModel
    NuggetCollection: NuggetCollection

define ["cs!base/models", "cs!page/models", "cs!probe/models"], (basemodels, pagemodels, probemodels) ->

    class NuggetModel extends basemodels.LazyModel

        relations: ->
            page:
                model: pagemodels.PageModel
                includeInJSON: false
            probeset:
                collection: probemodels.ProbeCollection
                includeInJSON: false

    class NuggetCollection extends basemodels.LazyCollection

        model: NuggetModel
        
        selectNuggets: (query) ->
            
            if query        
                if query.tags 
                    taglist = (tag.trim().toLowerCase() for tag in decodeURIComponent(query.tags).split(';'))
                else
                    taglist = []
                claimed = query.claimed or ''
                filteredlist = @filter (nugget) =>
                    switch claimed
                        when '1' then select = 1 if require('app').get('user').get('claimed').get(nugget.id)
                        when '0' then select = 1 if not require('app').get('user').get('claimed').get(nugget.id)
                        else select = 1
                    nuggettags = (tag.trim().toLowerCase() for tag in nugget.get('tags') or [])
                    tagged = if taglist then _.isEqual(_.intersection(nuggettags,taglist).sort(),taglist.sort()) else true
                    tagged and select and nugget.get('title') #HACK to exclude title-less nuggets
            else
                filteredlist = @models
            filteredcollection = new Backbone.Collection filteredlist


    NuggetModel: NuggetModel
    NuggetCollection: NuggetCollection

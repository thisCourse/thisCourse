define ["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, templates, styles) ->

    class ScheduleView extends baseviews.BaseView

        className: "section border2"
        buttonFadeSpeed: 60

        render: =>
            @$el.html templates.schedule_section @context()

        initialize: ->
            @dateViews = {}
            @model or= require("app").course
            @model.bind "add:lectures", @addLectures
            @model.bind "add:assignments", @addAssignments

            for lecture in @model.get("lectures").models
                @addLectures lecture, @model.get("lectures")

            for assignment in @model.get("assignments").models
                @addAssignments assignment, @model.get("assignments")

        addAssignments: (model, coll) ->
            @addScheduleItems
                model: model
                type: "**Assignment**"
                url: "assignments/" + model.id
            , model.getDate("due")

        addLectures: (model, coll) ->
            @addScheduleItems
                model: model
                type: "Lecture"
                url: "lectures/" + model.id
            , model.getDate("scheduled")

        addScheduleItems: (itemViewSettings, dates) ->
            if not dates then return
            dates = [dates] unless dates instanceof Array
            for date in dates
                @getOrCreateDateView(date).add_subview itemViewSettings.model.cid, new ScheduleItemView(itemViewSettings), ".schedule-items"
                #dateView.$(".schedule-items").append (new ScheduleItemView(itemViewSettings)).el
                itemViewSettings.continued = true

        getOrCreateDateView: (date) ->
            if not date then return
            if not @dateViews[date] # TODO: let the collection sorting mechanisms handle this
                insertAfter = null
                for oldDate of @dateViews
                    oldDate = new Date(oldDate)
                    if oldDate < date and (not insertAfter or (insertAfter < oldDate))
                        insertAfter = oldDate
                @dateViews[date] = new ScheduleDateView(date: date)
                if insertAfter
                    @dateViews[insertAfter].el.after @dateViews[date].render().el
                else
                    @$(".schedule-inner").prepend @dateViews[date].render().el
            return @dateViews[date]
            
    class ScheduleDateView extends baseviews.BaseView

        tagName: "tr"
        className: "date"
        
        render: =>
            @$el.html templates.schedule_date date: @options.date

    class ScheduleItemView extends baseviews.BaseView

        tagName: "tr"
        className: "date"
        
        render: =>
            @$el.html templates.schedule_item @context()


    ScheduleView: ScheduleView
    ScheduleDateView: ScheduleDateView
    ScheduleItemView: ScheduleItemView
    
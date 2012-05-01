define ["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, templates, styles) ->


    class AnalyticsView extends baseviews.BaseView
        
        events: ->
            "click .load-statistics": "loadStatistics"
            "click .hide-student-details": "hideStudentDetails"
        
        render: =>
            @$el.html templates.analytics @context()

        loadStatistics: =>
            @$(".load-statistics").attr("disabled", "disabled").text("Loading...")
            $.get "/analytics/studentstatistics/", (students) =>
                @$(".load-statistics").removeAttr("disabled").text("Refresh Statistics")
                @$(".student-stats").html templates.student_stats_header()
                students = new models.StudentStatisticsCollection(students).models
                students = _.sortBy students, (student) => student.get("total_points")
                points = []
                for student in students
                    @$(".student-stats").append templates.student_stats_row student.attributes
                    points.push student.get("total_points")
                require ["libs/protovis/protovis"], =>
                    w = 910
                    h = 200
                    x = pv.Scale.linear(0, pv.max(points)).range(0, w)
                    bins = pv.histogram(points).bins(x.ticks(30))
                    y = pv.Scale.linear(0, pv.max(bins, (d) -> d.y)).range(0, h)
                    vis = new pv.Panel().width(w).height(h).margin(20).canvas('point-histogram')
                    vis.add(pv.Bar).data(bins).bottom(0).left((d) -> x(d.x)).width((d) -> x(d.dx)).height((d) -> y(d.y)).fillStyle("#aaa").strokeStyle("rgba(255, 255, 255, .2)").lineWidth(1)
                    vis.add(pv.Rule).data(y.ticks(5)).bottom(y).strokeStyle("#fff").anchor("left").add(pv.Label).text(y.tickFormat)
                    vis.add(pv.Rule).data(x.ticks()).left(x).bottom(-5).height(5).anchor("bottom").add(pv.Label).text(x.tickFormat)
                    vis.add(pv.Rule).bottom(0)
                    vis.render()
                @$(".hide-student-details").show()
        
        hideStudentDetails: =>
            if @$(".student-stats").is(":visible")
                @$(".student-stats").fadeOut()
                @$(".hide-student-details").text("Show Student Details")
            else
                @$(".student-stats").fadeIn()
                @$(".hide-student-details").text("Hide Student Details")
                

    AnalyticsView: AnalyticsView
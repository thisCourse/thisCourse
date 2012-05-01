define ["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], \
        (baseviews, models, templates, styles) ->


    class AnalyticsView extends baseviews.BaseView
        
        events: ->
            "click .load-statistics": "loadStatistics"
        
        render: =>
            @$el.html templates.analytics @context()

        loadStatistics: =>
            @$(".load-statistics").attr("disabled", "disabled").text("Loading...")
            $.get "/analytics/studentstatistics/", (students) =>
                @$(".load-statistics").removeAttr("disabled").text("Refresh Statistics")
                @$(".student-stats").html templates.student_stats_header()
                students = new models.StudentStatisticsCollection(students).models
                students = _.sortBy students, (student) => student.get("total_points")
                for student in students
                    @$(".student-stats").append templates.student_stats_row student.attributes


    AnalyticsView: AnalyticsView
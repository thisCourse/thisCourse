define ["cs!base/models"], (basemodels) ->

    class StudentStatisticsModel extends Backbone.Model
        
        set: (obj) =>
            obj.total_points = 0
            for nugget in obj.claimed
                obj.total_points += nugget.points
            super

    class StudentStatisticsCollection extends Backbone.Collection

        model: StudentStatisticsModel

    StudentStatisticsModel: StudentStatisticsModel
    StudentStatisticsCollection: StudentStatisticsCollection

midtermgradeboundaries = [180,160,150,140,0]

grades = ['A','B','C','D','F']

examsummary = db.midterm.group
    key: email:true
    cond:{type:"proberesponse"}
    reduce: (obj,prev) -> 
        prev.csum+=obj.responsetime
        prev.count++
        prev.score+=obj.points
    initial: csum:0,count:0,score:0
    finalize: (out) ->
        out.avg_time = out.csum/out.count
        out.grade = grades[(out.score>=x for x in midtermgradeboundaries).indexOf(true)]

#mongoexport --db analytics --collection midterm -q '{"type":"proberesponse"}' -o midterm.json --jsonArray
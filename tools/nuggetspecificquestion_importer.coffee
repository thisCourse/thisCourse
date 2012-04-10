#probeimport = probe object

nuggetlist = app.get("course").get("nuggets")
probebynugget = {}
relec = new RegExp('(L[0-9]+)')
reclus = new RegExp('(C[0-9]+)')
renug = new RegExp('(N[0-9]+)')
_.each probeimport, (probedata,probeid) =>
    if not probedata then return
    lectag = relec.exec(probeid)[0]
    clustag = reclus.exec(probeid)[0]
    nugtag = renug.exec(probeid)[0]
    nuggetid = lectag+clustag+nugtag
    probebynugget[nuggetid] ?= {}
    probebynugget[nuggetid][probeid] = probedata

_.each probebynugget, (probes, nuggetid) =>
    lectag = relec.exec(nuggetid)[0]
    clustag = reclus.exec(nuggetid)[0]
    nugtag = renug.exec(nuggetid)[0]
    nugget = nuggetlist.find (model) =>
        lectag in model.get('tags') and clustag in model.get('tags') and nugtag in model.get('tags')
    nugget.fetch
        success: =>
            _.each probes, (probedata, probeid) =>
                questiontext = probedata.questiontext
                feedback = probedata.feedback or ""
                newprobe = nugget.get("probeset").create
                    question_code: probeid
                    question_text: questiontext
                    feedback: feedback
                , success: => 
                    answerlist = probedata.answers or []
                    console.log probedata
                    for ans in answerlist
                        newprobe.get("answers").create ans


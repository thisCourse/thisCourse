#probeimport = probe object

nuggetlist = app.get("course").get("nuggets")
_.each probeimport, (probedata,probeid) =>
    if not probedata then return
    relec = new RegExp('(L[0-9]+)')
    reclus = new RegExp('(C[0-9]+)')
    renug = new RegExp('(N[0-9]+)')
    lectag = relec.exec(probeid)[0]
    clustag = reclus.exec(probeid)[0]
    nugtag = renug.exec(probeid)[0]
    nugget = nuggetlist.find (model) =>
        lectag in model.get('tags') and clustag in model.get('tags') and nugtag in model.get('tags')
    questiontext = probedata.questiontext
    feedback = probedata.feedback or ""
    nugget.fetch().success =>
        newprobe = nugget.get("probeset").create
            question_code: probeid
            question_text: questiontext
            feedback: feedback
        , success: => 
            answerlist = probedata.answers or []
            console.log probedata
            for ans in answerlist
                newprobe.get("answers").create ans


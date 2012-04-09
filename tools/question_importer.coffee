#probeimport = probe object

nugget = app.get("course").get("nuggets").get("4f7dff82c66e822015000001")
nugget.fetch().success =>
    _.each probeimport, (probedata,probeid) =>
        if not probedata then return
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

        

#write question first then for answers: 

for probe in app.get('course').get('nuggets').last().get('probeset').models
    probe.destroy()

    





#preserving course question codes
probe.set(question_code: probe.get("_id"))


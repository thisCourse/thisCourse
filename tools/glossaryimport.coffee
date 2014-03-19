glossaryimport = []
anatomyaTag = app.get("course").get("nuggets").selectNuggets({"tags":"anatomy"})
anatomyaTag.models.forEach (nugget) =>
    nugget.fetch().success =>
        console.log nugget.get("title")
        title = nugget.get("title")
        nugget.get("page").fetch().success =>
            for contentmodel in nugget.get("page").get("contents").models 
                contentmodel.fetch().success =>
                    if not contentmodel
                        console.log "OMG contentmodel doesnt exist!"
                    console.log "THIS is the contentmodel" + contentmodel
                    for sectionmodel in contentmodel.get("sections").models 
                        sectionmodel.fetch().success =>
                            file = sectionmodel.get("items").models[0].get("file")
                            console.log file
                            glossaryimport.push({"html": "<img src = /s3/file_redirect?id=" + file + ">", "title": title, "anatomy": true})


models[0].get("page").get("contents").models[0].get("sections").models[0].get("items").models[0].get("file")
title = app.get("course").get("nuggets").selectNuggets({"tags":"anatomy"}).models[0].get("title")
#glossaryimport = [{"html": "<img src = /s3/file_redirect?id=" + file + ">", "title": title}]
glossarylist = require('app').get('course').get('glossary')

require ['cs!glossary/models'], (glossarymodels) =>
    console.log glossaryimport
    _.each glossaryimport, (glossary) =>
        glossarylist.create glossary,
            success: (glossarymodel) =>
                console.log glossarymodel#.get("title") + "created glossary model"
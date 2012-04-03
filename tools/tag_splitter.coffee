for nugget in app.get("course").get("nuggets").models
    if nugget.get("tags") not instanceof Array
        new_tags = (tag.trim() for tag in nugget.get("tags").split(","))
        nugget.set tags: new_tags
        console.log new_tags
        nugget.save()
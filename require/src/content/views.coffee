define ["cs!stuff", "less!./styles"], (stuff, styles) ->
  console.log "The views have been viewed!!!"
  $("body").append("<h2>This stuff was added by the view.</h2>")

define [], ->
  
  $("body").append("<b>THIS IS IT</b>")
  
  Router = Backbone.Router.extend
    initialize: (options) ->
      @route "temp", "temp", ->
        alert("temp")
  
  router = new Router
  
  router.route /test (.*)/, "test", (id) ->
    alert("test!!! " + id)
  
  Backbone.history.start()
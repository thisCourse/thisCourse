define [], () ->
  
  Router = Backbone.Router.extend
    initialize: (options) ->
      @route "temp", "temp", ->
        alert("temp")
  
  router = new Router


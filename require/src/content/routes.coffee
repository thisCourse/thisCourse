define ["jquery", "backbone"], ($, backbone) ->    
  console.log $.ajax

  Router = Backbone.Router.extend
    initialize: (options) ->
      @route "temp", "temp", ->
        alert("temp")
  
  router = new Router


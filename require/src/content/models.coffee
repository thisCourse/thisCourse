define [], () ->
  class ContentModel extends Backbone.Model
    initialize: ->
      alert('content model initialized')

define ["cs!./router"], (router) ->

	class AppModel extends Backbone.Model

		constructor: (options) ->
			@router = new router.BaseRouter root_url: options.root_url or "/"
			Backbone.history.start pushState: true

		navigate: (url) =>
			if not url then return
	        if url.slice(-1) != "/"
	            url += "/"    
	        @router.navigate url, true

    return
    	AppModel: AppModel
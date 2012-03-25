Backbone.Model.prototype.idAttribute = "_id"

class window.File extends Backbone.Model
	defaults:
		name:"file"
		fileurl: "picture.jpg"
		type: "picture"
		tags: ["file","stuff","whatever"] #TODO: Delete later


class window.FileCollection extends Backbone.Collection
	model: File



class window.FileView extends BaseView

	className: 'FileView'

	template = Handlebars.compile($('#fileview-template').html())

	events:
		'click .trash': 'clear'
		'click .file': 'select'

	initialize:=>
		@model?.bind 'change', @render
		@model?.bind 'destroy', @close

	render:=>
		@$el.append(template(@model.toJSON()))

	clear:=>
		@model.destroy()

	select:->
		@options.parent.$('.file').not(@$('.file')).removeClass('active')
		@$('.file').toggleClass('active')
		@options.parent.selectedId = @model.id

	editName:->
		@$el.find('.file').find('.display,.edit').addClass('editing')

		


window.files = new FileCollection

class window.BrowseView extends BaseView

	className: 'BrowseView'

	el: $("#filebrowser")

	template = Handlebars.compile($('#browseview-template').html())

	events:
		'click button#upload': 'uploadFile'
		'click .nav .selectors': 'filterTypes'
		'click .nav .tagselectors': 'filterTags'
		'click button#select': 'chooseFile'

	initialize: =>
		#@funcNum = @getUrlParam('CKEditorFuncNum')
		@filteredcollection = @collection.filter (file) ->
			true
		@typefilter = 'all'
		@tagfilter = null
		@collection.bind('add',@render)
		@render()

	getUrlParam: (paramname) ->
		reParam = new RegExp('(?:[\?&]|&amp;)' + paramName + '=([^&]+)', 'i')
		match = window.location.search.match(reParam)
		if match and match.length > 1 then match[1] else ''

	render: =>
		@$el.html ""
		@$el.append(template())

		@$('#'+@typefilter).parent().addClass('active')
		@filteredcollection = @collection.filter (file) =>
			if @typefilter=='all'
				if @tagfilter? then @tagfilter in file.get('tags') else true
			else
				file.get('type') == @typefilter
		taglist = []

		for file in @filteredcollection
			for tag in file.get('tags')
				taglist.push(tag)
			fileView = new FileView
				model: file
				parent: @
			@$('.filelist').append(fileView.render())
		if taglist.length<1
			@$('.taglist').append("<li>No Tags</li>")
		else
			for tag in _.uniq(taglist)
				@$('.taglist').append("<li><a class='tagselectors' tagid='"+tag+"'>"+tag+"</a></li>")

	uploadFile: =>
		file = new File
			type: ['picture','file','th-large'][Math.floor(Math.random()*3)]
			_id: Math.random()
			tags: [['file','stuff'],['whatever','dogs','french','early','gandalf','snack','file'],['one','snack']][Math.floor(Math.random()*3)]
		@collection.add(file)

	chooseFile: =>
		@selectedId

	filterTypes: (ev) =>
		@typefilter = ev.target.id
		@tagfilter = null
		@render()

	filterTags: (ev) =>
		@tagfilter = ev.target.tagid
		@typefilter = 'all'
		@render()

window.filebrowse = new BrowseView
	collection: files




###parseUrl = (url) ->
	



getUrlParam = (paramname) ->
	reParam = new RegExp('(?:[\?&]|&amp;)' + paramName + '=([^&]+)', 'i')
	match = window.location.search.match(reParam)
	return if match and match.length > 1 then match[1] else ''

[CKEditorFuncNum, path] = parseUrl(window.location.href)

funcNum = getUrlParam('CKEditorFuncNum')
fileUrl = '/file/file.txt'
window.opener.CKEDITOR.tools.callFunction(funcNum, fileUrl)Syntax###


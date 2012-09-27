ckeditor_config = {}

ckeditor_config.toolbar =
[
    { name: 'document', items : [ 'Source','-','Save','-','Templates' ] },
    { name: 'clipboard', items : [ 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo' ] },
    //{ name: 'editing', items : [ 'Find','Replace','-','SelectAll' ] },
    //'/',
    { name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike','Subscript','Superscript','-','RemoveFormat' ] },
    { name: 'paragraph', items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-',
        'JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock' ] },
    { name: 'links', items : [ 'Link','Unlink' ] },
    { name: 'insert', items : [ 'Image','Table','HorizontalRule','SpecialChar' ] },
    //'/',
    { name: 'styles', items : [ 'Styles','Format','Font','FontSize' ] },
    { name: 'colors', items : [ 'TextColor','BGColor' ] },
    { name: 'tools', items : [ 'Maximize', 'ShowBlocks' ] }
]

ckeditor_config.extraPlugins = 'autogrow'
ckeditor_config.autoGrow_bottomSpace = 30
ckeditor_config.autoGrow_maxHeight = 1000
ckeditor_config.autoGrow_minHeight = 300
ckeditor_config.autoGrow_onStartup = true
CKEDITOR.plugins.add( 'glossary',
{
    init: function( editor )
    {
        // Plugin logic goes here...
        editor.addCommand( 'glossaryDialog', new CKEDITOR.dialogCommand( 'glossaryDialog' ) );
        
        editor.ui.addButton( 'Glossary',
        {
        label: 'Insert Glossary Definition',
        command: 'glossaryDialog',
        icon: this.path + 'images/icon.png'
        } );
        
    CKEDITOR.dialog.add( 'glossaryDialog', function ( editor )
        {
            return {
                // Basic properties of the dialog window: title, minimum size.
                // http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.dialogDefinition.html
                title : 'Glossary Properties',
                minWidth : 400,
                minHeight : 200,
                // Dialog window contents.
                // http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.definition.content.html
                contents :
                [
                    {
                        // Definition of the Basic Settings dialog window tab (page) with its id, label, and contents.
                        // http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.contentDefinition.html
                        id : 'tab1',
                        label : 'Basic Settings',
                        elements :
                        [
                            {
                                // Dialog window UI element: a text input field for the glossary text.
                                // http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.ui.dialog.textInput.html
                                type : 'text',
                                id : 'glossary',
                                // Text that labels the field.
                                // http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.ui.dialog.labeledElement.html#constructor
                                label : 'Glossary',
                                // Validation checking whether the field is not empty.
                                validate : CKEDITOR.dialog.validate.notEmpty( "Glossary field cannot be empty" ),
                                "default": editor.getSelection().getSelectedText()
                            },
                            {
                                // Another text input field for the explanation text with a label and validation.
                                type : 'text',
                                id : 'title',
                                label : 'Glossary Definition',
                                validate : CKEDITOR.dialog.validate.notEmpty( "Glossary definition field cannot be empty" )
                            }    
                        ]
                    },
                    {
                        // Definition of the Advanced Settings dialog window tab with its id, label and contents.
                        id : 'tab2',
                        label : 'Advanced Settings',
                        elements :
                        [
                            {
                                // Yet another text input field for the glossary ID.
                                // No validation added since this field is optional.
                                type : 'text',
                                id : 'id',
                                label : 'Id'
                            }
                        ]
                    }
                ],
                // This method is invoked once a user closes the dialog window, accepting the changes.
                // http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.dialogDefinition.html#onOk
                onOk : function()
                {
                    // A dialog window object.
                    // http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.html 
                    var dialog = this;
                    // Create a new glossary element and an object that will hold the data entered in the dialog window.
                    // http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dom.document.html#createElement
                    var glossary = editor.document.createElement( 'glossary' );

                    // Retrieve the value of the "title" field from the "tab1" dialog window tab.
                    // Send it to the created element as the "title" attribute.
                    // http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dom.element.html#setAttribute
                    glossary.setAttribute( 'title', dialog.getValueOf( 'tab1', 'title' ) );
                    // Set the element's text content to the value of the "glossary" dialog window field.
                    // http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dom.element.html#setText
                    glossary.setText( dialog.getValueOf( 'tab1', 'glossary' ) );

                    // Retrieve the value of the "id" field from the "tab2" dialog window tab.
                    // If it is not empty, send it to the created glossary element. 
                    // http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.html#getValueOf
                    var id = dialog.getValueOf( 'tab2', 'id' );
                    if ( id )
                        glossary.setAttribute( 'id', id );

                    // Insert the newly created glossary into the cursor position in the document.                  
                    // http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.editor.html#insertElement
                    editor.insertElement( glossary );
                }
            };
        } );
    }
} );

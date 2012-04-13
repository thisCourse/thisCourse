define [], () ->
    
    # set default data-binding attribute name to "data", globally
    Backbone.ModelBinding.Configuration.configureAllBindingAttributes("data")

    # a modification to the standard Backbone ModelBinding Convention, so it won't
    # overwrite form fields that are currently active (thereby moving cursor to end)
    StandardBindingIgnoringActiveInput = {}
    
    _getElementType = (element) ->
        type = element[0].tagName.toLowerCase()
        if type is "input"
            type = element.attr("type") or "text"
        return type

    StandardBindingIgnoringActiveInput.bind = (selector, view, model, config) ->
        modelBinder = this
        view.$(selector).each (index) ->
            element = view.$(this)
            elementType = _getElementType(element)
            attribute_name = config.getBindingValue(element, elementType)
            modelChange = (changed_model, val) ->
                if not element.is(":focus")
                    element.val val

            setModelValue = (attr_name, value) ->
                # alert "setting " + attr_name + " to " + value
                data = {}
                data[attr_name] = value
                model.set data

            elementChange = (ev) ->
                setModelValue attribute_name, view.$(ev.target).val()

            modelBinder.registerModelBinding model, attribute_name, modelChange
            modelBinder.registerElementBinding element, elementChange
            attr_value = model.get(attribute_name)
            if attr_value?
                element.val attr_value
            else
                elVal = element.val()
                setModelValue attribute_name, elVal if elVal

    # set all the "texty" ModelBinding conventions to use the handler defined above
    Backbone.ModelBinding.Conventions.text.handler = StandardBindingIgnoringActiveInput
    Backbone.ModelBinding.Conventions.textarea.handler = StandardBindingIgnoringActiveInput
    Backbone.ModelBinding.Conventions.password.handler = StandardBindingIgnoringActiveInput
    Backbone.ModelBinding.Conventions.number.handler = StandardBindingIgnoringActiveInput
    Backbone.ModelBinding.Conventions.tel.handler = StandardBindingIgnoringActiveInput
    Backbone.ModelBinding.Conventions.search.handler = StandardBindingIgnoringActiveInput
    Backbone.ModelBinding.Conventions.url.handler = StandardBindingIgnoringActiveInput
    Backbone.ModelBinding.Conventions.email.handler = StandardBindingIgnoringActiveInput

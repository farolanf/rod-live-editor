function removeJsComments(str) {
    str = ('__' + str + '__').split('');
    var mode = {
        singleQuote: false,
        doubleQuote: false,
        regex: false,
        blockComment: false,
        lineComment: false,
        condComp: false
    };
    for (var i = 0, l = str.length; i < l; i++) {

        if (mode.regex) {
            if (str[i] === '/' && str[i - 1] !== "\\") {
                mode.regex = false;
            }
            continue;
        }

        if (mode.singleQuote) {
            if (str[i] === "'" && str[i - 1] !== "\\") {
                mode.singleQuote = false;
            }
            continue;
        }

        if (mode.doubleQuote) {
            if (str[i] === '"' && str[i - 1] !== "\\") {
                mode.doubleQuote = false;
            }
            continue;
        }

        if (mode.blockComment) {
            if (str[i] === '*' && str[i + 1] === '/') {
                str[i + 1] = '';
                mode.blockComment = false;
            }
            str[i] = '';
            continue;
        }

        if (mode.lineComment) {
            if (str[i + 1] === 'n' || str[i + 1] === 'r') {
                mode.lineComment = false;
            }
            str[i] = '';
            continue;
        }

        if (mode.condComp) {
            if (str[i - 2] === '@' && str[i - 1] === '*' && str[i] === '/') {
                mode.condComp = false;
            }
            continue;
        }

        mode.doubleQuote = str[i] === '"';
        mode.singleQuote = str[i] === "'";

        if (str[i] === '/') {

            if (str[i + 1] === '*' && str[i + 2] === '@') {
                mode.condComp = true;
                continue;
            }
            if (str[i + 1] === '*') {
                str[i] = '';
                mode.blockComment = true;
                continue;
            }
            if (str[i + 1] === '/') {
                str[i] = '';
                mode.lineComment = true;
                continue;
            }
            mode.regex = true;

        }

    }
    return str.join('').slice(2, -2);
}

function getModule(name) {
    return modules[name];
}

function render(content) {
    if (Array.isArray(content)) {
        var output = '';
        for (var i = 0; i < content.length; ++i)
            output += renderModule(content[i]);
        return output;
    }

    return renderModule(content);
}

function renderModule(instance) {
    if (typeof instance != 'object') {
        return instance;
    }

    var module = getModule(instance.name);
    if (!module) {
        console.error("cannot find module definition for ", instance);
        return '';
    }

    if (!module.hasOwnProperty("output")) {
        console.error("no output defined for module ", instance.name);
        return '';
    }

    //Remove JS comments from output definition
    var output = removeJsComments(module.output);

    if (!module.properties) {
        console.info("no properties in the module ", instance.name, " defined");
        return editor.injectInstanceData(output, instance.id);
    }

    var customReplace = true;
    for (var property in module.properties)
        output = output.replace(new RegExp('%' + property + '%', 'g'), getPropertyValue(property, instance, module, customReplace));

	//Replace Global Variables
	// for (var property in module.properties)
     //   
	for(var key in global) {
		output = output.replace(new RegExp('%' + key + '%', 'g'), global[key]); 
	}

    return editor.injectInstanceData(output, instance.id);
}

function getPropertyValue(property, instance, module, customReplace) {
    var value = '';
    var moduleProperty = module.properties ? module.properties[property] : null;

    if (!moduleProperty) {
        console.error("module ", instance.name, " doesn't have a property ", property);
        return value;
    }

    //Check if this property is an alias with a different output (we add customReplace && to avoid an infinite loop) 
    if (customReplace && moduleProperty.hasOwnProperty("alias")) {

        var alias = moduleProperty.alias;

        if (module.properties.hasOwnProperty(alias)) {
            //There is an alias, use values from a different property, but do not use the customReplace so we get the raw value.
            customReplace = false;
            value = getPropertyValue(alias, instance, module, customReplace);
        } else {
            console.error("Invalid alias in ", property, " in module ", instance.name, ". There is no property named ", alias);
        }

    } else {
        //There is no alias, use this property's values
        if (instance.hasOwnProperty(property)) {
            value = instance[property];
        } else if (moduleProperty.hasOwnProperty("default")) {
            value = moduleProperty.default;
        } else {
            console.error("property ", property, " in module ", instance.name, " doesn't have a default value");
        }
    }

    //If property is of type text do replacements 
    if (moduleProperty.hasOwnProperty("type") && moduleProperty.type == "text") {
        console.log(value);
    }

    /* Conditional Replace: override value property if necessary */
    if ((alias || customReplace) && moduleProperty.hasOwnProperty("replace")) {
        replaceProperty = moduleProperty.replace;

        if (replaceProperty.hasOwnProperty("condition")) {
            var conditionFunction = replaceProperty.condition;
            if ((typeof(conditionFunction)) == 'function') {
                var conditionResult = conditionFunction(value);
                if (replaceProperty.hasOwnProperty(conditionResult)) {
                    var newOutput = replaceProperty[conditionResult];
					
					 if ((typeof(newOutput)) == 'function') {
							value = newOutput(value); 
					 }
					 else{
					        value = newOutput.replace(new RegExp('%value%', 'g'), value); 
					}					 
                } else {
                    console.error("Missing result child ", conditionResult, " for \"replace\" parameter of ", property, " in module ", instance.name, ". Add a child element under 'replace' parent with name ", conditionResult, " and sample value containing %value%. E.g: 'Some Content %value%'.");
                }
            } else {
                console.error("Incorrect type for child \"condition\"  on \"replace\" parameter of  property ", property, " in module ", instance.name, ": it should be a function.");
            }
        } else {
            console.error("Missing \"condition\" child on \"replace\" parameter of property ", property, " in module ", instance.name);
        }
    }
    return moduleProperty.type == "container" ? editor.getContainerPlaceholder(property, instance.id, render(value)) : value;
}
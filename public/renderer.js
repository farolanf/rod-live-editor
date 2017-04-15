'use strict';

// load dependencies on test environment
if (typeof require !== 'undefined') {
    var Editor = require('./utils/editor');
}

/**
 * Renders content using specified modules and global properties.
 * 
 * @param {object} modules - The modules object.
 * @param {object} globalProperties - The global properties object.
 */
function Renderer(modules, globalProperties) {

    return {
        render,
        renderModule,
        renderContainer,
        getPropertyValue,
    };

    /**
     * Remove javascript comments from a string.
     * 
     * @param {string} str - The string to search for comments.
     * @private
     */
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

    /**
     * Get module specified by name.
     * 
     * @param {string} name - The name of the module.
     * @return {object} - The module.
     */
    function getModule(name) {
        return modules[name];
    }

    /**
     * Renders the content.
     * 
     * If clean is false then render additional data to be used by the editor
     * to identify containers, also render instance data and text wrappers.
     * 
     * @param {array} content - The content.
     * @param {boolean} clean - Render without meta data if true.
     * @return {string} - The rendered HTML.
     */
    function render(content, clean) {
        if (Array.isArray(content)) {
            var output = '';
            for (var i = 0; i < content.length; ++i)
                output += renderModule(content[i], clean);
            return output;
        }

        return renderModule(content, clean);
    }

    /**
     * Render an instance of module.
     * 
     * If clean is false then render additional data to be used by the editor
     * to identify containers, also render instance data and text wrappers.
     *
     * @param {object} instance - The instance object.
     * @param {boolean} clean - Render without meta data if true.
     * @return {string} - The rendered HTML.
     */
    function renderModule(instance, clean) {
        if (typeof instance != 'object') {
            return Editor.wrapText(instance);
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
            return clean ? output : 
                Editor.injectInstanceData(output, instance.id, instance.name);
        }

        // check visibility
        let visible = getPropertyValue('visible', instance, module, true, false); 
        if (visible !== true && visible !== 'true' && clean) {
            // render nothing on final render
            return '';
        }

        // visible on the live editor should only be true or false
        visible = visible === true || visible === 'true';

        var customReplace = true;
        for (var property in module.properties)
            output = output.replace(new RegExp('%' + property + '%', 'g'), 
                getPropertyValue(property, instance, module, customReplace, clean));

        //Replace Global Variables with their values
        for(var key in globalProperties) {
            output = output.replace(new RegExp('%' + key + '%', 'g'), globalProperties[key].value); 
        }

        return clean ? output :
            Editor.injectInstanceData(output, instance.id, instance.name, visible);
    }

    /**
     * Renders property value.
     * 
     * @param {string} property - The property name.
     * @param {object} instance - The instance object.
     * @param {object} module - The module object.
     * @param {boolean} customReplace - Use custom replace.
     * @param {boolean} clean - Render without meta data if true.
     * @return {string} - The rendered output.
     */
    function getPropertyValue(property, instance, module, customReplace, clean) {
        var value = '';
        var moduleProperty = module.properties ? module.properties[property] : null;

        if (!moduleProperty) {
            if (property === 'visible') {
                if (instance.hasOwnProperty('visible')) {
                    return instance['visible'];
                }
                // visible property defaults to true if not present
                return true;
            }
            console.error("module ", instance.name, " doesn't have a property ", property);
            return value;
        }

        //Check if this property is an alias with a different output (we add customReplace && to avoid an infinite loop) 
        if (customReplace && moduleProperty.hasOwnProperty("alias")) {

            var alias = moduleProperty.alias;

            if (module.properties.hasOwnProperty(alias)) {
                // There is an alias, use values from a different property, but do not use the customReplace so we get the raw value.
                value = getPropertyValue(alias, instance, module, false, clean);
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
            // console.log(value);
        }

        /* Conditional Replace: override value property if necessary */
        if ((alias || customReplace) && moduleProperty.hasOwnProperty("replace")) {
            var replaceProperty = moduleProperty.replace;

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
        return moduleProperty.type == "container" ? 
            (clean ? render(value, clean) : renderContainer(property, instance.id, value)) 
            : value;
    }

    /**
     * Renders container meta data along with its value.
     * 
     * @param {string} name - The container name.
     * @param {string} id - The parent id.
     * @param {any} value - The container value.
     * @return {string} - The rendered HTML.
     */
    function renderContainer(name, id, value) {
        return Editor.getContainerPlaceholder(name, id, render(value));
    }
}

// export the Renderer on test environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Renderer;
}

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
 * @param {string} language - Current language.
 */
function Renderer(modules, globalProperties, language) {

  language = language || config.defaultLanguage;

  return {
    render,
    renderModule,
    renderContainer,
    getPropertyValue,
    removeJsComments,
  };

  /**
   * Remove javascript comments from a string.
   * 
   * @param {string} str - The string to search for comments.
   * @return {string} - The str with removed comments.
   * @private
   */
  function removeJsComments(str) {
    return str.replace(/\/\*[^*]*?\*\//g, '')
      .replace(/(.+\s*)\/\/[^\n]*?(\n|$)/g, '$1$2') // keep new line
      .replace(/$\s*\/\/[^\n]*?(\n|$)/g, ''); // eat new line
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
      log.error({
        msg: `Cannot find module definition for '${instance.name}'`,
      });
      return '';
    }

    if (!module.hasOwnProperty("output")) {
      log.error({
        instanceId: instance.id,
        msg: `No output defined for module '${instance.name}'`,
      });
      return '';
    }

    // inject helper function to get property value
    // without replace functionality to avoid recursive calls
    instance.getPropertyValue = function(name) {
      if (this.hasOwnProperty(name)) {
        return this[name];
      }
      else if (module.properties.hasOwnProperty(name)) {
        const prop = module.properties[name];
        return prop.default;
      }
    };

    //Remove JS comments from output definition
    var output = removeJsComments(module.output);
    output = Renderer.prettify(output);

    if (!module.properties) {
      log.error({
        instanceId: instance.id,
        msg: `No properties in the module '${instance.name}' defined`,
      });
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

    // substitute global properties
    output = output.replace(/%([a-zA-Z0-9_-]+?)%/g, function(m0, m1) {
      return getGlobalValue(m1);
    });

    return clean ? output :
      Editor.injectInstanceData(output, instance.id, instance.name, visible);

    /**
     * Get global property value.
     * 
     * @param {string} name - The global property name.
     * @param {int} depth - Current nested alias depth.
     */
    function getGlobalValue(name, depth) {
      if (globalProperties.hasOwnProperty(name)) {
        const property = globalProperties[name];
        let value;
        // only use alias from the original property
        if (!depth && property.hasOwnProperty('alias')) {
          value = getGlobalValue(property.alias, depth + 1)
        }
        else {
          value = property.value;
        }
        // i18n
        if (typeof value === 'object') {
          if (value.hasOwnProperty(language) && value[language] !== '') {
            value = value[language];
          }
          else {
            value = '[?]';
            log.warn({
              property: name,
              language,
              msg: `Missing global property value for language '${language}'`,
            });
          }
        }
        // only use replace from the original property
        if (!depth) {
          value = replace(property, value,
            `Replace condition not found for global property '${name}'`,
            `Invalid condition type for global property '${name}'`,
            `Condition result '%result%' not found for global property '${name}'`
          );
        }
        return value;
      }
      else {
        log.error({
          instanceId: instance.id,
          msg: `Invalid global property '${name}' on instance '${instance.id}'`,
        });
      }
    }
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
      log.error({
        instanceId: instance.id,
        msg: `Module '${instance.name}' doesn't have a property '${property}'`,
      });
      return value;
    }

    //Check if this property is an alias with a different output (we add customReplace && to avoid an infinite loop) 
    if (customReplace && moduleProperty.hasOwnProperty("alias")) {

      var alias = moduleProperty.alias;

      if (module.properties.hasOwnProperty(alias)) {
        // There is an alias, use values from a different property, but do not use the customReplace so we get the raw value.
        value = getPropertyValue(alias, instance, module, false, clean);
      } else {
        log.error({
          instanceId: instance.id,
          msg: `Invalid alias '${property}' in module '${instance.name}'. There is no property named '${alias}'.`,
        });
      }

    } else {
      //There is no alias, use this property's values
      if (instance.hasOwnProperty(property)) {
        const msg = `Missing value for language '${language}' on instance '#${instance.id}' property '${property}'`;
        value = instance[property];
        value = getValue(value, msg, function() {
          log.warn({
            instanceId: instance.id,
            property,
            language,
            msg,
          });
        });
      } else if (moduleProperty.hasOwnProperty("default")) {
        const msg = `Missing default value for language '${language}' on module '${module.name}' property '${property}'`;
        value = moduleProperty.default;
        value = getValue(value, msg, function() {
          log.warn({
            instanceId: instance.id,
            module: module.name,
            moduleGroup: store.modules.group(),
            property,
            language,
            msg,
          });
        });
      } else if (!moduleProperty.type) {
        // default is optional for internal property
      } else {
        log.error({
          instanceId: instance.id,
          msg: `Property '${property}' in module '${instance.name}' doesn't have a default value.`,
        });
      }
    }

    // i18n
    function getValue(value, err, errorFn) {
      if (moduleProperty.type !== 'container' && typeof value === 'object') {
        if (value.hasOwnProperty(language) && value[language] !== '') {
          return value[language];
        }
        else {
          // console.error(err);
          errorFn && errorFn();
          return '[?]';
        }
      }
      return value;
    }

    //If property is of type text do replacements 
    if (moduleProperty.hasOwnProperty("type") && moduleProperty.type == "text") {
      // console.log(value);
    }

    if (alias || customReplace) {
      value = replace(moduleProperty, value,
        `Missing "condition" child on "replace" parameter of property '${property}', in module '${instance.name}'`,
        
        `Incorrect type for child "condition"  on "replace" parameter of property '${property}' in module '${instance.name}': it should be a function.`,

        `Missing property '%result%' on replace object of property '${property}' in module '${instance.name}'. Add property '%result%' on replace object and sample value with '%value%'. E.g: Some content '%value%'`,

        instance
      );
    }

    value = Renderer.prettify(value);
    return moduleProperty.type == "container" ?
      (clean ? render(value, clean) : renderContainer(property, instance.id, value))
      : value;
  }

  /**
   * Replace value specified by replace property if any.
   * 
   * @param {object} property - The object to check for a replace property.
   * @param {any} value - The original value.
   * @param {string} conditionErr - Error to display when condition not found.
   * @param {string} conditionTypeErr - Error for invalid condition type.
   * @param {string} resultErr - Error for result not found. %result% will be replaced with the result of condition function.
   * @param {object} instance - The instance.
   */
  function replace(property, value, conditionErr, conditionTypeErr, resultErr, instance) {
    if (property.hasOwnProperty("replace")) {
      var replaceProperty = property.replace;
      if (replaceProperty.hasOwnProperty("condition")) {
        var conditionFunction = replaceProperty.condition;
        if ((typeof (conditionFunction)) == 'function') {
          var conditionResult = conditionFunction(value, instance);
          if (replaceProperty.hasOwnProperty(conditionResult)) {
            var newOutput = replaceProperty[conditionResult];
            if ((typeof (newOutput)) == 'function') {
              value = newOutput(value, instance);
            }
            else {
              value = newOutput.replace(new RegExp('%value%', 'g'), value);
            }
          } else {
            log.error({
              instanceId: instance.id,
              msg: resultErr.replace(/%result%/g, conditionResult),
            });
          }
        } else {
          log.error({
            instanceId: instance ? instance.id : null,
            msg: conditionTypeErr,
          });
        }
      } else {
        log.error({
          instanceId: instance.id,
          msg: conditionErr,
        });
      }
    }
    return value;
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

/**
 * Process PHP tags.
 * 
 * @param {string} str - String to search for the tags.
 * @return {string} - The processed string.
 */
Renderer.prettify = function(str) {
  if (typeof str !== 'string') {
    return str;
  }
  str = str.replace(/<\?php[^>]*?\/\*\s*(.*?)\s*\*\/.*?\?>/g, '$1');
  str = str.replace(/<\?php/g, '&lt;?php');
  str = str.replace(/\?>/g, '?&gt;');
  return str;
};

// export the Renderer on test environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Renderer;
}

'use strict';

/**
 * Instance helpers.
 * 
 * A collection of operations for an instance.
 * 
 * @param {(object|string)} instance - The instance object or its id.
 */
function Instance(instance) {
  // support usage without new, e.g var foo = Instance(instance)
  if (!(this instanceof Instance)) {
    return new Instance(instance);
  }
  
  // load the instance if an id is given
  if (typeof instance === 'string' || typeof instance === 'number') {
    const id = instance;
    instance = editor.findInstance(id);
    if (!instance) {
      throw new Error('invalid instance id', id);
    }
  }

  const module = store.modules.modules()[instance.name];

  return Object.assign(this, {
    getContainers,
    getProperties,
    setProperty,
    render,
    renderContainerChildren,
    cleanContainers,

    /**
     * Get the instance id.
     * 
     * @return {int} id - The instance id.
     * @public
     */
    get id() {return instance.id},

    /**
     * Get the instance name.
     * 
     * @return {string} name - The instance name.
     * @public
     */
    get name() {return instance.name},
  });

  /**
   * Get container properties of this instance.
   * 
   * Each property of the returned object is an object with properties:
   * - type: 'container'
   * - value: the value from the instance or the container default value
   * - isDefault: true if the value is the container default value
   * 
   * @return {object} - An object whose properties describe container properties.
   * @public
   */
  function getContainers() {
    const props = {};
    if (module) {
      _.forOwn(module.properties, function(val, key) {
        if (val.type === 'container' && !val.alias) {
          props[key] = {
            type: val.type,
            value: instance.hasOwnProperty(key) ? instance[key] : val.default,
            isDefault: !instance.hasOwnProperty(key),
          };
        }
      });
    }
    return props;
  }

  /**
   * Get all properties from this instance module.
   * 
   * Each property of the returned object is an object with properties:
   * - type: the property type
   * - value: the value from the instance or the property default value
   * - isDefault: true if the value is the property default value
   * 
   * @return {object} - An object whose properties describe the module properties.
   * @public
   */
  function getProperties() {
    const props = {};
    if (module) {
      _.forOwn(module.properties, function(val, key) {
        if (val.type !== 'container' && !val.alias) {
          props[key] = {
            type: val.type,
            value: instance.hasOwnProperty(key) ? instance[key] : val.default,
            isDefault: !instance.hasOwnProperty(key),
          };
        }
      });
    }
    return props;
  }

  /**
   * Set the property of the instance.
   * 
   * @param {string} name - The property name.
   * @param {any} value - The property value.
   * @public
   */
  function setProperty(name, value) {
    instance[name] = value;
  }

  /**
   * Render the instance.
   * 
   * @return {string} - The rendered HTML.
   * @public
   */
  function render() {
    const renderer = store.createRenderer(app.getLanguage());
    return renderer.renderModule(instance);
  }

  /**
   * Render children of a container owned by this instance.
   * 
   * @param {string} name - The container name.
   * @return {string} - The rendered HTML.
   * @public
   */
  function renderContainerChildren(name) {
    const renderer = store.createRenderer(app.getLanguage());
    return renderer.getPropertyValue(name, instance, module, true);
  }

  /**
   * Delete empty containers from this instance.
   * 
   * @public
   */
  function cleanContainers() {
    _.forOwn(module.properties, function(val, key) {
      if (val.type === 'container') {
        if (instance.hasOwnProperty(key) && instance[key].length === 0) {
          delete instance[key];
        }
      }
    });    
  }
}
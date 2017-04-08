'use strict';

function Instance(instance) {
  if (!(this instanceof Instance)) {
    return new Instance(instance);
  }
  
  if (typeof instance === 'string' || typeof instance === 'number') {
    instance = editor.findInstance(instance);
    if (!instance) {
      throw new Error('invalid instance id');
    }
  }

  const module = store.modules.modules()[instance.name];
  const renderer = store.createRenderer();

  return {
    getContainers,
    getProperties,
    setProperty,
    render,
    renderContainerChildren,
    cleanContainers,
    get id() {return instance.id},
    get name() {return instance.name},
  };

  function getContainers() {
    const props = {};
    _.forOwn(module.properties, function(val, key) {
      if (val.type === 'container' && !val.alias) {
        props[key] = {
          type: val.type,
          value: instance.hasOwnProperty(key) ? instance[key] : val.default,
          isDefault: !instance.hasOwnProperty(key),
        };
      }
    });
    return props;
  }

  function getProperties() {
    const props = {};
    _.forOwn(module.properties, function(val, key) {
      if (val.type !== 'container' && !val.alias) {
        props[key] = {
          type: val.type,
          value: instance.hasOwnProperty(key) ? instance[key] : val.default,
          isDefault: !instance.hasOwnProperty(key),
        };
      }
    });
    return props;
  }

  function setProperty(name, value) {
    instance[name] = value;
  }

  function render() {
    return renderer.renderModule(instance);
  }

  function renderContainerChildren(name) {
    return renderer.getPropertyValue(name, instance, module, true);
  }

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
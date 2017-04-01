function Instance(instance) {
  if (!(this instanceof Instance)) {
    return new Instance(instance);
  }
  
  if (typeof instance === 'string' || typeof instance === 'number') {
    instance = editor.findInstance(instance);
  }

  const module = modules[instance.name];

  return {
    getProperties,
    setProperty,
    render,
    get id() {return instance.id},
  };

  function getProperties() {
    const props = {};
    _.forOwn(module.properties, function(val, key) {
      if (val.type !== 'container') {
        props[key] = {
          type: val.type,
          value: instance.hasOwnProperty(key) ? instance[key] : val.default,
        };
      }
    });
    return props;
  }

  function setProperty(name, value) {
    instance[name] = value;
  }

  function render() {
    return renderModule(instance);
  }
}
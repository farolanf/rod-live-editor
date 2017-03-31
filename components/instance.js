function Instance(instance) {
  if (!(this instanceof Instance)) {
    return new Instance(instance);
  }
  
  const module = modules[instance.name];

  return {
    getProperties,
  };

  function getProperties() {
    const props = {};
    _.forOwn(module.properties, function(val, key) {
      if (val.type !== 'container') {
        props[key] = instance.hasOwnProperty(key) ? instance[key] : val.default;
      }
    });
    return props;
  }
}
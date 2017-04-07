'use strict';

function Modules() {
  self = this;
  const ee = new EventEmitter();

  return Object.assign(this, {
    modules: {},
    getGroups,
    getGroupModules,
    subscribe,
  });

  function getGroups(cb) {
    $.getJSON('/api/module/group', cb);
  }

  function getGroupModules(name, cb) {
    $.getJSON(`/api/module/group/${name}`, function(data) {
      loadModules(data);
      cb(self.modules);
      ee.emitEvent('modules', self.modules);
    }); 
  }

  function loadModules(data) {
    self.modules = {};
    data.forEach(function(modstr) {
      let mod;
      eval(`mod = ${modstr}`);
      self.modules[mod.name] = mod;
    });
  }

  function subscribe(fn) {
    ee.addListener('modules', fn);
  }
}
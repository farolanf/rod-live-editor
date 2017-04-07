'use strict';

function Modules() {
  self = this;

  return Object.assign(this, {
    modules: {},
    getGroups,
    getGroupModules,
  });

  function getGroups(cb) {
    $.getJSON('/api/module/group', cb);
  }

  function getGroupModules(name, cb) {
    $.getJSON(`/api/module/group/${name}`, function(data) {
      loadModules(data);
      cb(self.modules);
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
}
'use strict';

function Modules() {
  const ee = new EventEmitter();
  let modules = {};

  return Object.assign(this, {
    modules() {return modules},
    getGroups,
    getGroupModules,
    subscribe,
  });

  function getGroups(cb) {
    $.getJSON('/api/module/group', cb);
  }

  function getGroupModules(name, success, error) {
    $.ajax({
      url: `/api/module/group/${name}`,
      success: _success,
      error: _error,
    });
    function _success(data) {
      loadModules(data);
      success && success(modules);
      ee.emit('modules', modules);
    }
    function _error(xhr, status) {
      console.log('fail to get module group', name);
      error && error(xhr, status);
    }
  }

  function loadModules(data) {
    modules = {};
    data.forEach(function(modstr) {
      let mod;
      eval(`mod = ${modstr}`);
      modules[mod.name] = mod;
    });
  }

  function subscribe(fn) {
    ee.addListener('modules', fn);
  }
}
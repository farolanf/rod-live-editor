'use strict';

/**
 * Manages the modules store and handles modules REST API.
 */
function Modules() {
  const ee = new EventEmitter();
  let modules = {};
  let group;

  return Object.assign(this, {
    modules() {return modules},
    group() {return group},
    loadGroups,
    loadGroupModules,
    subscribe,
    isEmpty,
  });

  function loadGroups(cb) {
    $.getJSON(uri.path()+'api/module/group', cb);
  }

  function loadGroupModules(name, success, error) {
    $.ajax({
      url: uri.path()+`api/module/group/${name}`,
      success: _success,
      error: _error,
    });
    function _success(data) {
      group = name;
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

  function isEmpty() {
    return _.isEmpty(modules);
  }
}
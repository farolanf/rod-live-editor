'use strict';

/**
 * Manages the modules store and handles modules REST API.
 */
function Modules() {
  let modules = {};
  let group;

  return Object.assign(this, {
    modules() {return modules},
    group() {return group},
    loadGroups,
    loadGroupModules,
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
      events.emit('modules-changed', modules);
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

  function isEmpty() {
    return _.isEmpty(modules);
  }
}
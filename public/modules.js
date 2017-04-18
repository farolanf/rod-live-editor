'use strict';

/**
 * Manages the modules and use modules REST API.
 */
function Modules() {
  let modules = {};
  
  // active group
  let group;

  return Object.assign(this, {
    modules() {return modules},
    group() {return group},
    loadGroups,
    loadGroupModules,
    isEmpty,
  });

  /**
   * Fetch group names.
   * 
   * @param {function} cb - Callback function to receive array of group names.
   */
  function loadGroups(cb) {
    $.getJSON(uri.path()+'api/module/group', cb);
  }

  /**
   * Load modules for the given group.
   * 
   * @param {string} name - The name of the group.
   * @param {function} success - Callback function to receive the modules.
   */
  function loadGroupModules(name, success) {
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
      console.error('failed to get modules for group', name);
    }
  }

  /**
   * Load module js code onto properties.
   *
   * @param {array} data - Array of js code.
   * @private
   */
  function loadModules(data) {
    // clear the properties
    modules = {};
    addSystemModules();
    data.forEach(function(modstr) {
      let mod;
      eval(`mod = ${modstr}`);
      // create property for this module
      modules[mod.name] = mod;
      // add visible property if not exist
      if (mod.properties && !mod.properties.hasOwnProperty('visible')) {
        mod.properties.visible = {type: 'property', default: 'true'};
      }
    });
  }

  /**
   * Add modules that always included on every module group.
   */
  function addSystemModules() {
    addBlockInclude();
  }

  /**
   * Add block-include module.
   */
  function addBlockInclude() {
    modules['block-include'] = {
      "name": "block-include",
      "output": `<div style="background: black; color: white; text-align: center;   padding: 50px;">Remote content with id %remoteId%</div>`,
      "properties": {
        "remoteId": {
          "default": "",
          "type": "property"
        }
      }
    };    
  }

  /**
   * Check for empty modules (no properties).
   */
  function isEmpty() {
    return _.isEmpty(modules);
  }
}
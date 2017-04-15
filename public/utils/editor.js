'use strict';

/**
 * Handles instance manipulation.
 * 
 * @param {object} content - The content store.
 */
function Editor(content) {

  let newInstanceId = 1;

  events.addListener('content-changed', load);

  return {
    createInstance,
    findInstance,
    removeInstance,
    moveInstance,
    cloneInstance,

    // used by test
    regenerateId,

    /**
     * Get a new instance id. Used by test.
     * 
     * @return {int} - The new id.
     * @private
     */
    get newInstanceId() {return newInstanceId;},

    /**
     * Set a new instance id. Used by test.
     * 
     * @private
     */
    set newInstanceId(val) {newInstanceId = val;},

    /**
     * Get the content.
     * 
     * @param {array} - The content.
     * @public
     */
    get content() {return content.content()},
  };

  /**
   * Handles content-changed event. Prepares a new content.
   * 
   * @private
   */
  function load() {
    // reset id
    newInstanceId = 1;
    prepareContent(content.content());
  }

  /**
   * Inject id and helper properties into instances.
   * 
   * @param {object} content - The content.
   * @param {object} parent - Content parent.
   * @param {string} container - Content container name.
   * @private
   */
  function prepareContent(content, parent, container) {
    if (Array.isArray(content)) {
      content.forEach(function(instance) {
        instance.id = newId();
        instance.parent = parent;
        instance.container = container;
        prepareInstanceContainers(instance);
      });
    }
  }

  /**
   * Process containers of this instance.
   * 
   * @param {object} instance - The instance.
   * @private
   */
  function prepareInstanceContainers(instance) {
    for (let key in instance) {
      if (instance.hasOwnProperty(key)) {
        const val = instance[key];
        if (Array.isArray(val)) {
          prepareContent(val, instance, key);
        }
      }
    }
  }

  /**
   * Find an instance with specified id.
   * 
   * @param {int} id - The instance id.
   * @param {boolean} remove - Remove the found instance.
   * @public
   */
  function findInstance(id, remove) {
    return _findInstance(content.content(), id, remove);
  }

  /**
   * Find an instance with specified id.
   * 
   * @param {array} arr - The content to start the search.
   * @param {int} id - The instance id.
   * @param {boolean} remove - Remove the found instance.
   * @private
   */
  function _findInstance(arr, id, remove) {
    let result;
    const index = arr.findIndex(function(instance) {
      if (instance.id === id) {
        return true;
      }
      for (let key in instance) {
        if (instance.hasOwnProperty(key)) {
          const val = instance[key];
          if (Array.isArray(val)) {
            result = _findInstance(val, id, remove);
            if (result) {
              return true;
            }
          }
        }
      }
    });
    if (result) {
      return result;
    }
    if (index !== -1) {
      if (remove) {
        return arr.splice(index, 1)[0];
      }
      else {
        return arr[index];
      }
    }
    return null;
  }

  /**
   * Move instance.
   * 
   * @param {int} id - The instance to be moved.
   * @param {int} parentId - The new parent id.
   * @param {string} container - The new container name.
   * @param {int} siblingId - The new sibling id.
   * @public
   */
  function moveInstance(id, parentId, container, siblingId) {
    _moveInstance(content.content(), id, parentId, container, siblingId);
  }

  /**
   * Move instance to the new container of another instance.
   * 
   * @param {array} content - The content to start the search.
   * @param {int} id - The instance to be moved.
   * @param {int} parentId - The new parent id.
   * @param {string} container - The new container name.
   * @param {int} siblingId - The new sibling id.
   * @private
   */
  function _moveInstance(content, id, parentId, container, siblingId) {
    const instance = _removeInstance(content, id);
    const parent = _findInstance(content, parentId);
    insertInstance(instance, parent, container, siblingId);
  }

  /**
   * Create an instance inside the specified container on the 
   * instance specified by parentId.
   * 
   * @param {string} name - The module name to be instantiated.
   * @param {int} parentId - The parent id.
   * @param {string} container - The container name.
   * @param {int} siblingId - The next sibling id.
   * @public
   */
  function createInstance(name, parentId, container, siblingId) {
    const instance = {name: name, id: newId()};
    const parent = parentId ? _findInstance(content.content(), parentId) : null;
    if (parent) {
      insertInstance(instance, parent, container, siblingId);
    }
    else {
      content.content().push(instance);
    }
    return instance;
  }

  /**
   * Insert an instance into specified container on another instance.
   * 
   * @param {object} instance - The instance to be inserted.
   * @param {object} parent - The instance to be the new parent.
   * @param {string} container - The container name on the new parent.
   * @param {int} siblingId - The new sibling id.
   * @private
   */
  function insertInstance(instance, parent, container, siblingId) {
    if (!parent.hasOwnProperty(container)) {
      parent[container] = [];
    }
    const arr = parent[container];
    if (siblingId) {
      const siblingIndex = arr.findIndex(function(instance) {
        return instance.id === siblingId;
      });
      arr.splice(siblingIndex, 0, instance);
    }
    else {
      arr.push(instance);
    }
    instance.parent = parent;
    instance.container = container; 
  }

  /**
   * Remove an instance from the content.
   * 
   * @param {int} id - The instance id.
   * @public
   */
  function removeInstance(id) {
    return _removeInstance(content.content(), id);
  }

  /**
   * Remove an instance from the content.
   * 
   * @param {int} id - The instance id.
   * @return {object} - The removed instance.
   * @private
   */
  function _removeInstance(arr, id) {
    return _findInstance(arr, id, true);
  }

  /**
   * Clone the instance and place it as the next sibling.
   * 
   * @param {int} id - The instance id.
   * @public
   */
  function cloneInstance(id) {
    _cloneInstance(content.content(), id);
    events.emit('content-changed');
  }

  /**
   * Clone the instance and place it as the next sibling.
   * 
   * @param {array} content - The content to start searching.
   * @param {int} id - The instance id.
   * @private
   */
  function _cloneInstance(content, id) {
    const instance = _findInstance(content, id);
    const newInstance = _.cloneDeep(instance);
    regenerateId(newInstance);
    insertInstanceAfter(content, newInstance, instance);
    newInstance.parent = instance.parent;
  }

  /**
   * Insert instance after another instance.
   * 
   * @param {array} content - The root content. 
   * @param {object} instance - The instance. 
   * @param {object} sibling - The instance that will become previous sibling. 
   * @private
   */
  function insertInstanceAfter(content, instance, sibling) {
    let container;
    if (sibling.parent) {
      container = sibling.parent[sibling.container];
    }
    else {
      container = content;
    }
    const siblingIndex = _.findIndex(container, function(item) {
      if (item.id === sibling.id) {
        return true;
      }
    });
    container.splice(siblingIndex + 1, 0, instance);
  }

  /**
   * Generate new id for an instance and its children.
   * 
   * Used on the new instance clone.
   * 
   * @param {object} instance - The instance.
   * @public
   */
  function regenerateId(instance) {
    instance.id = newId();
    _.forOwn(instance, function(val) {
      if (Array.isArray(val)) {
        _.each(val, function(item) {
          regenerateId(item);
        });
      }
    });
  }

  /**
   * Get a new id.
   * 
   * @private
   */
  function newId() {
    return newInstanceId++;
  }
};

/**
 * Renders container meta data followed by its children.
 * 
 * A container meta data is a DOM comment containing data about the container.
 * 
 * @param {string} name - The container name.
 * @param {string} parentId - The instance id.
 * @param {string} children - The children HTML.
 * @return {string} - The HTML.
 */
Editor.getContainerPlaceholder = function(name, parentId, children) {
  const containerJson = JSON.stringify({
    name: name,
    parentId: parentId
  });
  return `<!-- instance-container ${containerJson} --> ${children}`;
}

/**
 * Inject instance data to the rendererd HTML.
 * 
 * @param {string} str - The HTML to be injected.
 * @param {string} id - The instance id.
 * @param {string} name - The instance name.
 * @return {string} - The HTML.
 */
Editor.injectInstanceData = function(str, id, name, visible) {
  str = Editor.wrapText(str);
  return str.replace(/(?:<!DOCTYPE [^]*?>)?\s*(<.*?)>/i, 
    `$1 data-id="${id}" data-name="${name}" data-visible="${visible}">`);
}

/**
 * Wrap a text for later manipulation.
 * 
 * @param {string} str - The text.
 * @return {string} - The HTML.
 */
Editor.wrapText = function(str) {
  // check if it's a text and not an element
  if (!/^\s*<[^]*>\s*$/.test(str)) {
    // wraps the text 
    return `<span>${str}</span>`;
  }
  return str;
}

// export the Editor on test environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Editor;
}

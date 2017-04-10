'use strict';

function Editor(content) {

  let newInstanceId = 1;

  content.subscribe(load);

  return {
    createInstance,
    findInstance,
    removeInstance,
    moveInstance,
    cloneInstance,
    regenerateId,
    newId,
    get newInstanceId() {return newInstanceId;},
    set newInstanceId(val) {newInstanceId = val;},
    get content() {return content.content()},
  };

  function load() {
    prepareContent(content.content());
  }

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

  function findInstance(id, remove) {
    return _findInstance(content.content(), id, remove);
  }

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

  function moveInstance(id, parentId, container, siblingId) {
    _moveInstance(content.content(), id, parentId, container, siblingId);
  }

  function _moveInstance(content, id, parentId, container, siblingId) {
    const instance = _removeInstance(content, id);
    const parent = _findInstance(content, parentId);
    insertInstance(instance, parent, container, siblingId);
  }

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

  function removeInstance(id) {
    return _removeInstance(content.content(), id);
  }

  function _removeInstance(arr, id) {
    return _findInstance(arr, id, true);
  }

  function cloneInstance(id) {
    _cloneInstance(content.content(), id);
  }

  function _cloneInstance(content, id) {
    const instance = _findInstance(content, id);
    const newInstance = _.cloneDeep(instance);
    regenerateId(newInstance);
    insertInstanceAfter(content, newInstance, instance);
    newInstance.parent = instance.parent;
  }

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

  function newId() {
    return newInstanceId++;
  }
};

Editor.getContainerPlaceholder = function(name, parentId, children) {
  const containerJson = JSON.stringify({
    name: name,
    parentId: parentId
  });
  return `<!-- instance-container ${containerJson} --> ${children}`;
}

Editor.injectInstanceData = function(str, id, name) {
  str = Editor.wrapText(str);
  return str.replace(/(?:<!DOCTYPE [^]*?>)?\s*(<.*?)>/i, 
    `$1 data-id="${id}" data-name="${name}">`);
}

Editor.wrapText = function(str) {
  if (!/^\s*<[^]*>\s*$/.test(str)) {
    return `<span>${str}</span>`;
  }
  return str;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Editor;
}

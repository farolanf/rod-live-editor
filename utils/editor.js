
function Editor(_content) {

  if (!(this instanceof Editor)) {
    return new Editor(_content);
  }

  _content = _content || [];
  let newInstanceId = 1;

  prepareContent(_content);

  return {
    findInstance,
    removeInstance,
    moveInstance,
    regenerateId,
    get newInstanceId() {return newInstanceId;},
    set newInstanceId(val) {newInstanceId = val;},
    get content() {return _content},
  };

  function prepareContent(content) {
    if (Array.isArray(content)) {
      content.forEach(function(instance) {
        instance.id = newId();
        prepareInstanceContainers(instance);
      });
    }
  }

  function prepareInstanceContainers(instance) {
    for (const key in instance) {
      if (instance.hasOwnProperty(key)) {
        const val = instance[key];
        if (Array.isArray(val)) {
          prepareContent(val);
        }
      }
    }
  }

  function moveInstance(id, parentId, container, siblingId) {
    _moveInstance(_content, id, parentId, container, siblingId);
  }

  function _moveInstance(content, id, parentId, container, siblingId) {
    const instance = _removeInstance(content, id);
    const parent = _findInstance(content, parentId);
    insertInstance(instance, parent, container, siblingId);
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
  }

  function removeInstance(id) {
    return _removeInstance(_content, id);
  }

  function _removeInstance(arr, id) {
    return _findInstance(arr, id, true);
  }

  function findInstance(id, remove) {
    return _findInstance(_content, id, remove);
  }

  function _findInstance(arr, id, remove) {
    let result;
    const index = arr.findIndex(function(instance) {
      if (instance.id === id) {
        return true;
      }
      for (const key in instance) {
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

  function cloneInstance(content, id) {
    const instance = _findInstance(content, id);
    const newInstance = _.cloneDeep(instance);
    regenerateId(newInstance);
    insertAfter(newInstance, instance.id);
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

  function insertInstanceAfter(instance, siblingId) {
    const container = getContainer(siblingId);
  }

  function getContainer(id) {

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

Editor.injectInstanceData = function(str, id) {
  return str.replace(/(<.*?)>/, `$1 data-id="${id}">`);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Editor;
}

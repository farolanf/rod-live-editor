
const editor = {

  getContainerPlaceholder(name, parentId, children) {
    const containerJson = JSON.stringify({
      name: name,
      parentId: parentId
    });
    return `<!-- instance-container ${containerJson} --> ${children}`;
  },

  injectInstanceData(str, id) {
    return str.replace(/(<.*?)>/, `$1 data-id="${id}">`);
  },

  moveInstance(content, id, parentId, container, siblingId) {
    const instance = editor.removeInstance(content, id);
    const parent = editor.findInstance(content, parentId);
    editor.insertInstance(instance, parent, container, siblingId);
  },

  insertInstance(instance, parent, container, siblingId) {
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
  },

  removeInstance(arr, id) {
    return editor.findInstance(arr, id, true);
  },

  findInstance(arr, id, remove) {
    let result;
    const index = arr.findIndex(function(instance) {
      if (instance.id === id) {
        return true;
      }
      for (const key in instance) {
        if (instance.hasOwnProperty(key)) {
          const val = instance[key];
          if (Array.isArray(val)) {
            result = editor.findInstance(val, id, remove);
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
  },

  cloneInstance(content, id) {
    const instance = editor.findInstance(content, id);
    const newInstance = _.cloneDeep(instance);
    editor.regenerateId(newInstance);
    editor.insertAfter(newInstance, instance.id);
  },

  regenerateId(instance) {
    instance.id = editor.newId();
    _.forOwn(instance, function(val) {
      if (Array.isArray(val)) {
        _.each(val, function(item) {
          editor.regenerateId(item);
        });
      }
    });
  },

  insertInstanceAfter(instance, siblingId) {
    const container = editor.getContainer(siblingId);
  },

  getContainer(id) {
    
  },

  newId(start) {
    if (typeof this.newInstanceId === 'undefined') {
      this.newInstanceId = 1;
    }
    return this.newInstanceId++;
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = editor;
}


function getContainerPlaceholder(name, parentId, children) {
  const containerJson = JSON.stringify({
    name: name,
    parentId: parentId
  });
  return `<!-- instance-container ${containerJson} --> ${children}`;
}

function injectInstanceData(str, id) {
  return str.replace(/(<.*?)>/, `$1 data-id="${id}">`);
}

function moveInstance(content, id, parentId, container, siblingId) {
  const instance = removeInstance(content, id);
  const parent = findInstance(content, parentId);
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

function removeInstance(arr, id) {
  return findInstance(arr, id, true);
}

function findInstance(arr, id, remove) {
  let result;
  const index = arr.findIndex(function(instance) {
    if (instance.id === id) {
      return true;
    }
    for (const key in instance) {
      if (instance.hasOwnProperty(key)) {
        const val = instance[key];
        if (Array.isArray(val)) {
          result = findInstance(val, id, remove);
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    findInstance: findInstance,
    removeInstance: removeInstance,
    moveInstance: moveInstance,
  };
}
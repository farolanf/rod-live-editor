'use strict';

/**
 * Ease access of container data from container element.
 * 
 * @param {element} el - The container element.
 */
function ContainerElement(el) {
  const name = $(el).data('name');
  const parentId = $(el).data('parent-id');
  const parentInstance = parentId ? new Instance(parentId) : null;

  return Object.assign(this, {
    name,
    parentId,
    element: el,
    parentInstance,
  });
}
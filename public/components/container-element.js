'use strict';

/**
 * Wraps a container element to ease data extraction.
 * 
 * @param {element} el - The container element.
 */
function ContainerElement(el) {
  const name = $(el).data('name');
  const parentId = $(el).data('parent-id');
  const parentInstance = parentId ? new Instance(parentId) : null;

  return Object.assign(this, {
    // the name of the container
    name,

    // the instance id who owns the container
    parentId,

    // the Instance wrapper of the parent instance 
    parentInstance,

    // the container element
    element: el,
  });
}
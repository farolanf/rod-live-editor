'use strict';

function ContainerElement(el) {
  const name = $(el).data('name');
  const parentId = $(el).data('parent-id');
  const parentInstance = new Instance(parentId);

  return Object.assign(this, {
    name,
    parentId,
    element: el,
    parentInstance,
  });
}
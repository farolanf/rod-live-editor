'use strict';

function ContainerElement(el) {
  return Object.assign(this, {
    name: $(el).data('name'),
    parentId: $(el).data('parent-id'),
    element: el,
  });
}
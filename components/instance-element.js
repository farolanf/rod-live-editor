'use strict';

function InstanceElement(el) {
  return Object.assign(this, {
    id: $(el).data('id'),
    element: el,
  });
}
'use strict';

/**
 * Ease access of instance data from an instance element.
 * 
 * @param {element} el - The instance element.
 */
function InstanceElement(el) {
  return Object.assign(this, {
    id: $(el).data('id'),
    element: el,
  });
}
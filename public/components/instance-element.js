'use strict';

/**
 * Wraps an instance element to ease data extraction.
 * 
 * @param {element} el - The instance element.
 */
function InstanceElement(el) {
  return Object.assign(this, {
    // the instance id
    id: $(el).data('id'),
    
    // the instance element
    element: el,
  });
}
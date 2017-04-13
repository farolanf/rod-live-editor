'use strict';

const domutils = {
  /**
   * Convert coordinate to the root client coordinate.
   */
  topClientPos(x, y, win) {
    const top = win.top;
    while (win !== top) {
      if (win.frameElement) {
        const rect = win.frameElement.getBoundingClientRect();
        x += rect.left;
        y += rect.top;
      }
      win = win.parent;
    }
    return {x, y};
  },

  /**
   * Check if current cursor is over the element.
   */
  overElement(e, el) {
    const x = e.clientX;
    const y = e.clientY;
    const rect = el.getBoundingClientRect();
    return x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom;
  },

  /**
   * Filter container comment nodes.
   * 
   * Used with jQuery. 
   */
  instanceCommentFilter() {
    return this.nodeType === 8 && this.nodeValue.includes('instance-container');
  },
};
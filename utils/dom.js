
const domutils = {
  // traverse the ancestors to add up client coords
  topClientPos(x, y, refElement) {
    let win = refElement.ownerDocument.defaultView;
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
};
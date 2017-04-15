
function Undo(content) {

  const max = 10;
  const stack = [];
  let pos = 0;
  let latest = -1;

  return Object.assign(this, {
    push,
    undo,
    redo,
    canUndo,
    canRedo,
  });

  function push(stay) {
    if (pos === latest) {
      pos++;
      return;
    }
    stack[pos] = content.getJSON();
    latest = pos;
    !stay && pos++;
    if (pos >= max) {
      stack.shift();
      pos--;
      latest--;
    }
    events.emit('undo-changed');
  }

  function undo() {
    if (canUndo()) {
      if (pos > latest) {
        push(true);
      }
      pos--;
      content.fromJSON(stack[pos]);
      events.emit('undo-changed');
    }
  }

  function redo() {
    if (canRedo()) {
      pos++;
      content.fromJSON(stack[pos]);
      events.emit('undo-changed');
    }
  }

  function canUndo() {
    return pos > 0;
  }

  function canRedo() {
    return pos < latest;
  }
}
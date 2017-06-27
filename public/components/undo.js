
/**
 * Handles undo and redo.
 * 
 * @param {object} content - The content store.
 */
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

  /**
   * Save current state.
   */
  function push() {
    if (pos === latest) {
      pos++;
      return;
    }
    stack[pos] = content.getJs();
    latest = pos;
    pos++;
    if (pos > max) {
      stack.shift();
      pos--;
      latest--;
    }
    events.emit('undo-changed');
  }

  /**
   * Step backward in history.
   */
  function undo() {
    if (canUndo()) {
      if (pos > latest) {
        push();
        pos--;
      }
      pos--;
      content.fromJSON(stack[pos]);
      events.emit('undo-changed');
    }
  }

  /**
   * Step forward in history.
   */
  function redo() {
    if (canRedo()) {
      pos++;
      content.fromJSON(stack[pos]);
      events.emit('undo-changed');
    }
  }

  /**
   * If currently undoable.
   */
  function canUndo() {
    return pos > 0;
  }

  /**
   * If currently redoable.
   */
  function canRedo() {
    return pos < latest;
  }
}
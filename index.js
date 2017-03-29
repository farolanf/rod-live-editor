
$(init);

function init() {
  initEditor();
}

function initEditor() {
  Split(['.preview', '.property-view'], {
    sizes: [75, 25],
    minSize: 0
  });
  $('.preview').html(render(content));
}

function newId() {
  if (typeof newId.id === 'undefined') {
    newId.id = 1;
  }
  return newId.id++;
}



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
  initDrag();
}

function initDrag() {
  const containers = $('.module-container').toArray();
  initContainerChildren(containers);
  const drake = dragula(containers, {
    accepts(el, target, source, sibling) {
      return !$.contains(el, target);
    }
  });
}

function initContainerChildren(containers) {
  $(containers).children().addClass('module');
}

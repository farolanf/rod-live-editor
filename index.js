const SCROLL_SPEED = 1000; // pixels per second
let selectedElement;

const drake = dragula(null, {
  accepts(el, target, source, sibling) {
    return !$.contains(el, target);
  }
});

drake.on('over', function(el, container) {
  $(container).addClass('dragover');
}).on('out', function(el, container) {
  $(container).removeClass('dragover');
}).on('drop', function(el, target, source, sibling) {
  const id = $(el).data('id');
  const parentId = $(target).data('parent-id');
  const container = $(target).data('name');
  const siblingId = sibling ? $(sibling).data('id') : null;
  editor.moveInstance(content, id, parentId, container, siblingId);
}).on('dragend', function() {
  if (selectedElement) {
    showInstanceControls(selectedElement);
  }
});

$(init);

function init() {
  prepareContent(content);
  initRoutes();
  initEditor();
  initInstanceControls();
}

function prepareContent(content) {
  if (Array.isArray(content)) {
    content.forEach(function(instance) {
      instance.id = editor.newId();
      prepareInstanceContainers(instance);
    });
  }
  function prepareInstanceContainers(instance) {
    for (const key in instance) {
      if (instance.hasOwnProperty(key)) {
        const val = instance[key];
        if (Array.isArray(val)) {
          prepareContent(val);
        }
      }
    }
  }
}

function initRoutes() {
  const app = new senna.App();
  app.addRoutes([
    new senna.Route('/', function() {
      $('#app > *').hide();
      $('#editor').show();
    }),
    new senna.Route('/preview', function() {
      $('#app > *').hide();
      $('#app > iframe').attr('srcdoc', render(content)).show();
    })
  ]);
  app.navigate('/');
}

function initEditor() {
  Split(['.preview', '.property-view'], {
    sizes: [75, 25],
    minSize: 0
  });
  $('.preview').html(render(content));
  initElement('.preview');
  dragScroll(drake);
}

function initInstanceControls() {
  $('.instance-controls').on('click', function(e) {
    e.stopPropagation();
  });
  $('.instance-controls .edit-btn').on('click', function(e) {
    editInstanceContent(selectedElement);
  });
  $('.instance-controls .copy-btn').on('click', function(e) {
    cloneInstance(selectedElement);
  });
  $('.instance-controls .delete-btn').on('click', function(e) {
    deleteInstance(selectedElement);
  });
}

function dragScroll(drake) {
  const scrollInterval = 50;
  const scrollStep = SCROLL_SPEED / (1000 / scrollInterval);
  let dir = 0;
  $(document.body).on('mousemove', function(e) {
    const height = $(this).height();
    const y = e.pageY - this.scrollTop;
    const h = height * 0.1; 
    if (y < height * 0.1) {
      dir = (y - h) / h;
    } else if (y > height * 0.9) {
      dir = (y - height * 0.9) / h;
    }
    else {
      dir = 0;
    }
  });
  autoScroll();
  function autoScroll() {
    if (drake.dragging && dir !== 0) {
      this.scrollTop += dir * scrollStep;
    }
    setTimeout(autoScroll.bind(document.body), scrollInterval);
  }
}

function initElement(startElement) {
  initContainers(startElement);
  initInstanceElements(startElement);
}

function initContainers(startElement) {
  const meta = $('*', startElement).contents().filter(instanceCommentFilter);
  const containers = meta.parent();
  containers.addClass('instance-container');
  drake.containers = drake.containers.concat(containers.toArray());
  containers.each(function(i) {
    const json = meta[i].nodeValue.replace('instance-container', '');
    const data = JSON.parse(json);
    $(this).attr('data-name', data.name).attr('data-parent-id', data.parentId);
  });
}

function instanceCommentFilter() {
  return this.nodeType === 8 && this.nodeValue.includes('instance-container');
}

function initInstanceElements(startElement) {
  const childrenSelector = '.instance-container > *:not(br)';
  if ($(startElement).is(childrenSelector)) {
    initInstanceElement(startElement);
  }
  $(childrenSelector, startElement).each(function(i, el) {
    initInstanceElement(el);
  });
}

function initInstanceElement(el) {
  $(el).addClass('instance').on('click', function(e) {
    e.stopPropagation();
    if (this !== selectedElement) {
      deselectInstance(selectedElement);
    }
    selectInstance(this);
  }).on('blur', function(e) {
    deselectInstance(this);
  }).on('dblclick', function(e) {
    e.stopPropagation();
    editInstanceContent(this);
  }).on('mouseover', function(e) {
    e.stopPropagation();
    $(this).addClass('hover');
  }).on('mouseout', function(e) {
    $(this).removeClass('hover');
  });
}

function selectInstance(el) {
  selectedElement = el;
  $(el).addClass('active');
  showInstanceControls(el);
}

function deselectInstance(el) {
  $(el).removeClass('active').attr('contenteditable', false);
}

function editInstanceContent(el) {
  $(el).attr('contenteditable', true);
  setTimeout(function() {
    $(el).focus();
  });
}

function deleteInstance(el) {
  const id = $(el).data('id');
  editor.removeInstance(content, id);
  $(el).remove();
  hideInstanceControls();
}

function stopContentEditing() {
  $('[contenteditable="true"]').attr('contenteditable', false);
}

function cloneInstance(el) {
  const clone = $(el).clone().insertAfter(el);
  initElement(clone);
  deselectInstance(clone);
  editor.cloneInstance(content, $(el).data('id'));
}

function showInstanceControls(el) {
  const body = $('body');
  const rect = el.getBoundingClientRect();
  const x = rect.right;
  const y = rect.top + body.scrollTop();
  $('.instance-controls').css('left', x).css('top', y).removeClass('hidden');
}

function hideInstanceControls() {
  $('.instance-controls').addClass('hidden');
}

$(window).on('click', function() {
  deselectInstance(selectedElement);
  selectedElement = null;
});


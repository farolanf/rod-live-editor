const SCROLL_SPEED = 1000; // pixels per second
let selectedElement;

const drake = dragula(null, {
  accepts(el, target, source, sibling) {
    return !$.contains(el, target);
  }
});

$(init);

function init() {
  initRoutes();
  initEditor();
  initModuleControls();
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
  initContainers('body');
  dragScroll(drake);
}

function initModuleControls() {
  $('.instance-controls .edit-btn').on('click', function(e) {
    editInstanceContent(selectedElement);
  });
  $('.instance-controls .copy-btn').on('click', function(e) {
    cloneInstance(selectedElement);
  });
  $('.instance-controls .delete-btn').on('click', function(e) {
    $(selectedElement).remove();
  });
}

function initContainers(el) {
  const containers = $('.instance-container', el).toArray();
  drake.containers = drake.containers.concat(containers);
  initContainerChildren(containers);
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

function initContainerChildren(containers) {
  $(containers).children(':not(br)').each(function(i, el) {
    initInstanceElement(el);
  });
}

function initInstanceElement(el) {
  $(el).addClass('instance').on('click', function(e) {
    e.stopPropagation();
    if (selectedElement != this) {
      stopContentEditing();
    }
    selectedElement = this;
    showInstanceControls(this);
  }).on('blur', function(e) {
    $(this).attr('contenteditable', false);
    hideInstanceControls();
  }).on('dblclick', function(e) {
    e.stopPropagation();
    editInstanceContent(this);
  });
}

function editInstanceContent(el) {
  $(el).attr('contenteditable', true);
  setTimeout(function() {
    $(el).focus();
  });
}

function stopContentEditing() {
  $('[contenteditable="true"]').attr('contenteditable', false);
}

function cloneInstance(el) {
  const clone = $(el).clone().insertAfter(el);
  initInstanceElement(clone);
  initContainers(clone);
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
  hideInstanceControls();
});
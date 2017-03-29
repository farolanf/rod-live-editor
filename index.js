const SCROLL_SPEED = 1000; // pixels per second

$(init);

function init() {
  initRoutes();
  initEditor();
}

function initRoutes() {
  const app = new senna.App();
  app.addRoutes([
    new senna.Route('', function() {
      console.log('home');
      $('#app > *').hide();
      $('#editor').show();
    }),
    new senna.Route('/preview', function() {
      console.log('preview');
      $('#app > *').hide();
      $('#app > iframe').attr('srcdoc', render(content)).show();
    })
  ]);
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
  dragScroll(drake);
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
  $(containers).children().addClass('module');
}

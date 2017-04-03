window.app = new App();

function App() {
  const editor = window.editor = Editor(content);
  const propertyView = window.propertyView = PropertyView(editor);
  let preview;

  const dragond = new Dragond(['.module-list', '.module-list .list-group'], {
    getElement(el, src) {
      if ($(src).is('.module-view *')) {
        const rect = el.getBoundingClientRect();
        const clone = el.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.width = rect.width + 'px';
        clone.style.height = rect.height + 'px';
        // return clone;
      }
      return el;
    },
    accepts(el, con, src) {
      return !$(con).is('.module-view *');
    }
  });

  window.dragond = dragond;

  $(init);

  return {
    showInstanceControls,
    hideInstanceControls,
    renderPreview,
    renderInstance(instance) {preview.renderInstance(instance)},
    set preview(val) {preview = val;},
  };

  function init() {
    initRoutes();
    initEditor();
    initInstanceControls();
  }

  function initRoutes() {
    const app = new senna.App();
    app.addRoutes([
      new senna.Route('/', function() {
        $('#app > *').hide();
        $('#editor').show();
      }),
      new senna.Route('/preview', function() {
        hideInstanceControls();
        $('#app > *').hide();
        $('#app > iframe').attr('srcdoc', render(content)).show();
      }),
      new senna.Route('/json', function() {
        hideInstanceControls();
        $('#app > *').hide();
        const json = JSON.stringify(content, filterContent, 2);
        $('#app > #content-json').html(json).show();
      })
    ]);
    app.navigate('/');
  }

  function filterContent(key, value) {
    if (key === 'parent') {
      return;
    }
    return value;
  }

  function initEditor() {
    Split(['.module-view', '.preview', '.property-view'], {
      sizes: [25, 50, 25],
      minSize: 0
    });
    renderPreview();
  }

  function initInstanceControls() {
    $('.instance-controls').on('click', function(e) {
      e.stopPropagation();
    });
    $('.instance-controls .edit-btn').on('click', function(e) {
      preview.editInstanceContent();
    });
    $('.instance-controls .copy-btn').on('click', function(e) {
      preview.cloneInstance();
    });
    $('.instance-controls .delete-btn').on('click', function(e) {
      preview.deleteInstance();
    });
  }

  function showInstanceControls(el) {
    const rect = el.getBoundingClientRect();
    const pos = domutils.topClientPos(rect.right, rect.top, el);
    $('.instance-controls').css('left', pos.x).css('top', pos.y).removeClass('hidden');
  }

  function hideInstanceControls() {
    $('.instance-controls').addClass('hidden');
  }

  function renderPreview() {
    let html = render(content);
    html = html.replace(/<\/head>/, `
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dragula/3.7.2/dragula.min.css" />  </head>
        <link href="preview.css" rel="stylesheet">
      </head>
    `);
    html = html.replace(/<\/body>/, `
        <script src="https://code.jquery.com/jquery-3.1.1.min.js" integrity="sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8=" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/dragula/3.7.2/dragula.min.js"></script>
        <script src="preview.js"></script>
      </body>
    `);
    $('.preview').attr('srcdoc', html).on('load', function() {
      dragond.addIframe('.preview');
    });
  }
}
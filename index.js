'use strict';

window.app = new App();

function App() {
  const renderer = new Renderer(modules, globalProperties);
  const editor = window.editor = Editor(content);
  const propertyView = window.propertyView = PropertyView(editor);
  let preview, dragond;

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
    initDrag();
    initEditor();
    initInstanceControls();
    initActions();
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
        $('#app > iframe').attr('srcdoc', renderer.render(content)).show();
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

  function initDrag() {
    if (dragond) {
      dragond.destroy();
    }
    dragond = new Dragond(['.module-list', '.module-list .list-group'], {
      shadow: false,
      getElement(el, src) {
        // if ($(src).is('.module-view *')) {
        //   const rect = el.getBoundingClientRect();
        //   const clone = el.cloneNode(true);
        //   clone.style.position = 'absolute';
        //   clone.style.width = rect.width + 'px';
        //   clone.style.height = rect.height + 'px';
        //   // return clone;
        // }
        return el;
      },
      accepts(el, con, src) {
        return true;
        // return !con.classList.contains('list-group');
      },
      drop(e, el, con, src, sibling) {
        if ($(el).is('.instance') && $(con).is('.instance-container')) {
          // console.log('move', el, con, src, sibling, el.parentNode);
          con = new ContainerElement(con);
          src = new ContainerElement(src);
          el = new InstanceElement(el);
          sibling = new InstanceElement(sibling);
          editor.moveInstance(el.id, con.parentId, con.name, sibling.id);
          preview.cleanContainer(con.name, con.parentId);
          renderContainerChildren(src);
        }
      },
    });

    window.dragond = dragond;
  }

  function initActions() {
    $('.refresh-btn').on('click', refresh);
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
    const pos = domutils.topClientPos(rect.right, rect.top, el.ownerDocument.defaultView);
    $('.instance-controls').css('left', pos.x +'px')
      .css('top', pos.y+'px').removeClass('hidden');
  }

  function hideInstanceControls() {
    $('.instance-controls').addClass('hidden');
  }

  function renderPreview() {
    let html = renderer.render(content);
    html = html.replace(/<\/head>/, `
        <link href="preview.css" rel="stylesheet">
      </head>
    `);
    html = html.replace(/<\/body>/, `
        <script src="https://code.jquery.com/jquery-3.1.1.min.js" integrity="sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8=" crossorigin="anonymous"></script>
        <script src="preview.js"></script>
      </body>
    `);
    $('.preview').attr('srcdoc', html).off('load').on('load', function() {
      dragond.addIframe('.preview');
    });
  }

  function renderContainerChildren(con) {
    con.parentInstance.cleanContainers();
    if (con.parentInstance.getContainers()[con.name].isDefault) {
      preview.renderContainerChildren(con.parentInstance, con.name);
    }
  }

  function refresh() {
    initDrag();
    renderPreview();
  }

}
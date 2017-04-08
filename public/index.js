'use strict';

window.store = new Store();
window.app = new App();

function App() {

  const uri = URI(window.location.href);
  const query = parseQuery();
  const editor = window.editor = new Editor(store.content);
  const moduleView = new ModuleView(store, query.moduleGroup);
  const propertyView = window.propertyView = PropertyView(editor);
  const instanceMap = new InstanceMap(store.content, propertyView);
  let preview, dragond;

  store.content.subscribe(renderPreview);
  store.modules.subscribe(renderPreview);

  $(init);

  return {
    showInstanceControls,
    hideInstanceControls,
    renderPreview,
    _save,
    renderInstance(instance) {preview.renderInstance(instance)},
    set preview(val) {preview = val;},
  };

  function init() {
    initRoutes();
    initDrag();
    initEditor();
    initInstanceControls();
    initActions();
    if (query.id) {
      store.content.loadContent(query.id);  
    }
  }

  function initRoutes() {
    const url = window.location.pathname + window.location.search;
    const app = new senna.App();
    app.addRoutes([
      new senna.Route('/preview', function() {
        const renderer = store.createRenderer();
        const html = renderer.render(store.content.content(), true);
        hideInstanceControls();
        $('#app > *').hide();
        $('#app > iframe').attr('srcdoc', html).show();
      }),
      new senna.Route('/json', function() {
        hideInstanceControls();
        $('#app > *').hide();
        const json = JSON.stringify(store.content.content(), filterContent, 2);
        $('#app > #content-json').html(json).show();
      }),
      new senna.Route(url, function() {
        $('#app > *').hide();
        $('#editor').show();
      }),
    ]);
    app.navigate(url);
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
        if ($(src).is('.module-view *')) {
          const newEl = moduleView.getElement(el);
          return newEl;
        }
        return el;
      },
      accepts(el, con, src) {
        return !$(con).is('.module-view *') && $(el).is('[data-id]');
      },
      end(e, el, con, src, sibling) {
        if (+$(el).attr('data-id') === -1) {
          onCreateInstance(el, con, src, sibling);
        } else if ($(el).is('.instance') && $(con).is('.instance-container')) {
          onMoveInstance(el, con, src, sibling);
        }
      },
    });

    window.dragond = dragond;
  }

  function onCreateInstance(el, con, src, sibling) {
    const name = $(el).data('name');
    const container = $(con).data('name');
    const parentId = $(con).data('parent-id');
    sibling = new InstanceElement(sibling);
    const instance = editor.createInstance(name, parentId, container, sibling.id);
    $(el).attr('data-id', instance.id);
    preview.initElement(el);
    preview.cleanContainer(container, parentId);
  }

  function onMoveInstance(el, con, src, sibling) {
    con = new ContainerElement(con);
    src = new ContainerElement(src);
    el = new InstanceElement(el);
    sibling = new InstanceElement(sibling);
    editor.moveInstance(el.id, con.parentId, con.name, sibling.id);
    preview.cleanContainer(con.name, con.parentId);
    renderContainerChildren(src);
  }

  function initActions() {
    $('.save-btn').on('click', save);
    $('.refresh-btn').on('click', refresh);
  }

  function initEditor() {
    Split(['.module-view', '.preview', '.property-view'], {
      sizes: [25, 50, 25],
      minSize: 0
    });
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
    dragond.removeIframe('.preview');
    let html = store.createRenderer().render(store.content.content());
    html = html.replace(/<\/head>/, `
        <link href="preview.css" rel="stylesheet">
      </head>
    `);
    html = html.replace(/<\/body>/, `
        <script src="libs/js/jquery-3.1.1.min.js"></script>
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

  function save() {
    showConfirmModal('Save', 'Save the document?', 'Save', 'app._save()');
  }

  function _save() {
    const savingToast = toast('Saving...', 'info');
    const data = {
      id: query.id,
      content: JSON.stringify(store.content.content(), filterContent),
    };
    $.ajax({
      url: '/api/save',
      method: 'POST',
      data,
      success,
      error,
    });
    function success() {
      savingToast.reset();
      toast('Document saved.');
    }
    function error(xhr, status) {
      savingToast.reset();
      toast('Fail to save document.', 'error');
      console.log(status, xhr, data);
    }
  }

  function refresh() {
    initDrag();
    renderPreview();
  }

  function toast(msg, type) {
    const colors = {
      info: '#039be5',
      error: '#ef5350',
    };
    return $.toast({
      text: msg,
      position: 'top-right',
      bgColor: colors[type || 'info'],
    });
  }

  function showConfirmModal(title, msg, actionTitle, onclick) {
    const modal = $('#confirm-modal');
    $('.modal-title', modal).text(title);
    $('.confirm-msg', modal).text(msg);
    $('.btn-primary', modal).text(actionTitle).attr('onclick', onclick);
    modal.modal();
  }

  function parseQuery() {
    return URI(window.location.href).search(true);
  }
}
'use strict';

window.events = new EventEmitter();
window.uri = URI(window.location.href);
window.uiutils = new UIUtils();
window.store = new Store();
window.app = new App();

function App() {

  const query = parseQuery();
  const editor = window.editor = new Editor(store.content);
  const moduleView = new ModuleView(store, query.moduleGroup);
  const propertyView = window.propertyView = new PropertyView(editor, store.content);
  const preview = new Preview();
  const instanceMap = new InstanceMap(store.content, propertyView, preview);
  let dragond;

  store.content.subscribe(renderPreview);
  store.modules.subscribe(renderPreview);
  moduleView.subscribe(modulesViewChange);

  $(init);

  return {
    showInstanceControls,
    hideInstanceControls,
    renderPreview,
    _save,
    instanceCommentFilter,
    renderInstance(instance) {preview.renderInstance(instance)},
  };

  function init() {
    initEvents();
    initRoutes();
    initDrag();
    initEditor();
    initInstanceControls();
    initActions();
    if (query.id) {
      store.content.loadContent(query.id);  
    }
  }

  function initEvents() {
    events.addListener('instance-deleted', instanceDeleted);
  }

  function instanceDeleted() {
    if (store.content.isEmpty()) {
      renderPreview();
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
        $('#app > .preview-container').show()
          .find('iframe').attr('srcdoc', html).show();
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
    dragond = new Dragond(['.module-list', '.module-list .list-group', '.empty-container'], {
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
      inserts(el, con, src) {
        return !$(con).is('.empty-container');
      },
      end(e, el, con, src, parent, sibling) {
        if ($(con).is('.empty-container')) {
          createFirstInstance(el);
        }
        else if (+$(el).attr('data-id') === -1 && $(parent).is('.instance-container')) {
          onCreateInstance(el, parent, src, sibling);
        } else if ($(el).is('.instance') && $(parent).is('.instance-container')) {
          onMoveInstance(el, parent, src, sibling);
        }
      },
    });

    window.dragond = dragond;
  }

  function createFirstInstance(el) {
    const name = $(el).data('name');
    editor.createInstance(name);
    renderPreview();
  } 

  function onCreateInstance(el, con, src, sibling) {
    const name = $(el).data('name');
    const container = $(con).data('name');
    const parentId = $(con).data('parent-id');
    sibling = new InstanceElement(sibling);
    const instance = editor.createInstance(name, parentId, container, sibling.id);
    $(el).attr('data-id', instance.id);
    fixContainerComments(el, instance.id);
    preview.initElement(el);
    preview.cleanContainer(container, parentId);
  }

  function fixContainerComments(el, parentId) {
    $('*', el).contents().filter(instanceCommentFilter).each(function() {
      this.nodeValue = this.nodeValue.replace(
        /("parentId":\s*)\-?\d+/g, `$1${parentId}`);
    });
  }

  function instanceCommentFilter() {
    return this.nodeType === 8 && this.nodeValue.includes('instance-container');
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
    Split(['.module-view', '.preview-container', '.property-view'], {
      sizes: [25, 50, 25],
      minSize: 0
    });
    $('.property-view .globals-btn').on('click', function() {
      propertyView.editGlobals();
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

  function modulesViewChange() {
    // a check is needed in case modules have been fetched before
    // dragond is ready
    dragond && dragond.initContainers();
  }

  function renderPreview() {
    if (store.content.isEmpty()) {
      renderEmptyPreview();
      return;
    }
    else {
      hideEmptyContainer();
    }
    if (store.modules.isEmpty()) {
      return;
    }
    dragond.removeIframe('.preview');
    let html = store.createRenderer().render(store.content.content());
    html = html.replace(/<\/head>/, `
        <link href="preview.css" rel="stylesheet">
      </head>
    `);
    $('.preview').attr('srcdoc', html).off('load').on('load', function() {
      dragond.addIframe('.preview');
      preview.init(this.contentWindow);
    });
  }

  function renderContainerChildren(con) {
    con.parentInstance.cleanContainers();
    if (con.parentInstance.getContainers()[con.name].isDefault) {
      preview.renderContainerChildren(con.parentInstance, con.name);
    }
  }

  function renderEmptyPreview() {
    $('.empty-container').show();
  }

  function hideEmptyContainer() {
    $('.empty-container').hide();
  }

  function save() {
    uiutils.showConfirmModal('Save', 'Save the document?', 'Save', 'app._save()');
  }

  function _save() {
    const savingToast = uiutils.toast('Saving...', 'info');
    const data = {
      id: query.id,
      content: JSON.stringify(store.content.content(), filterContent),
      moduleGroup: store.modules.group(),
    };
    $.ajax({
      url: uri.path()+'api/save',
      method: 'POST',
      data,
      success,
      error,
    });
    function success() {
      savingToast.reset();
      uiutils.toast('Document saved.');
    }
    function error(xhr, status) {
      savingToast.reset();
      uiutils.toast('Fail to save document.', 'error');
      console.log(status, xhr, data);
    }
  }

  function refresh() {
    initDrag();
    renderPreview();
  }

  function parseQuery() {
    return URI(window.location.href).search(true);
  }
}
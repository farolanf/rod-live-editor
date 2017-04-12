'use strict';

// init globals
window.events = new EventEmitter();
window.uri = URI(window.location.href);
window.uiutils = new UIUtils();
window.store = new Store();
window.editor = new Editor(store.content);
window.propertyView = new PropertyView(editor, store.content);
window.app = new App();

function App() {

  // get the query params
  const query = parseQuery();

  const moduleView = new ModuleView(store, query.moduleGroup);
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

  // response to instance-deleted event
  function instanceDeleted() {
    if (store.content.isEmpty()) {
      renderPreview();
    }
  }

  /**
   * Create single page app with senna.
   * 
   * Handle route request by showing just the relevant element.
   */
  function initRoutes() {
    const app = new senna.App();
    app.addRoutes([
      // handle /preview
      new senna.Route(uri.path()+'preview', function() {
        const renderer = store.createRenderer();
        const html = renderer.render(store.content.content(), true);
        hideInstanceControls();
        $('#app > *').hide();
        $('#app > iframe').attr('srcdoc', html).show();
      }),
      // handle /json
      new senna.Route(uri.path()+'json', function() {
        hideInstanceControls();
        $('#app > *').hide();
        const json = JSON.stringify(store.content.all(), filterContent, 2);
        $('#app > #content-json').html(json).show();
      }),
      // catch all routes for current origin
      new senna.Route(/.*/, function() {
        $('#app > *').hide();
        $('#editor').show();
      }),
    ]);
  }

  // filter parent property to avoid circular reference
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
    // init dragond with specified containers
    dragond = new Dragond(['.module-list', '.module-list .list-group', '.empty-container'], {
      shadow: false,
      getElement(el, src) {
        if ($(src).is('.module-view *')) {
          // get the element that will be placed
          const newEl = moduleView.getElement(el);
          return newEl;
        }
        return el;
      },
      // prevent drop to .module-view
      accepts(el, con, src) {
        return !$(con).is('.module-view *') && $(el).is('[data-id]');
      },
      // prevent insertion to .empty-container
      inserts(el, con, src) {
        return !$(con).is('.empty-container');
      },
      // show invalid feedback when dragging a non document element
      // into .empty-container
      enter(e, el, con) {
        if ($(con).is('.empty-container') && !$(el).is('[data-root]')) {
          $(con).removeClass('dg-dragover').addClass('dg-invalid');
        }
      },
      end(e, el, con, src, parent, sibling) {
        // create the first instance when dropping to .empty-container
        if ($(con).is('.empty-container')) {
          $(el).is('[data-root]') && createFirstInstance(el);
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

  // update parentId on container comments
  function fixContainerComments(el, parentId) {
    $('*', el).contents().filter(instanceCommentFilter).each(function() {
      this.nodeValue = this.nodeValue.replace(
        /("parentId":\s*)\-?\d+/g, `$1${parentId}`);
    });
  }

  // filter container comment nodes
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
    // create split panes
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
    // place on the top right corner
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
    // inject css on the preview iframe
    html = html.replace(/<\/head>/, `
        <link href="preview.css" rel="stylesheet">
      </head>
    `);
    $('.preview').attr('srcdoc', html).off('load').on('load', function() {
      dragond.addIframe('.preview');
      preview.init(this.contentWindow);
    });
  }

  /**
   * Render the default element for a container.
   * 
   * When the container becomes empty the default value needs
   * to be rendered again.
   */
  function renderContainerChildren(con) {
    // remove container property with empty array
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
      content: filteredContent(),
      moduleGroup: store.modules.group(),
    };
    $.ajax({
      url: uri.path()+'api/save',
      method: 'POST',
      data,
      success,
      error,
    });
    function success(data) {
      savingToast.reset();
      uiutils.toast('Document saved.');
    }
    function error(xhr, status) {
      savingToast.reset();
      uiutils.toast('Fail to save document.', 'error');
      console.log(status, xhr, data);
    }
    // filter properties which cause circular object reference
    function filteredContent() {
      return JSON.parse(JSON.stringify(store.content.all(), filterContent));
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
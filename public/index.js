'use strict';

// uri eases uri parts extraction, used to form ajax url
window.uri = URI(window.location.href);

// emitter for application wide events
window.events = new EventEmitter();

// generic ui helpers used by several components
window.uiutils = new UIUtils();

// store stores data in one place to ease passing around the whole data
window.store = new Store();

// editor only need a content store so no need to pass the whole store
window.editor = new Editor(store.content);

window.app = new App();

/**
 * Main application logic.
 */
function App() {

  // get the query params
  const query = uri.search(true);

  const propertyView = new PropertyView(editor, store.content);

  const moduleView = new ModuleView(store, query.moduleGroup);

  const preview = new Preview(propertyView);

  const instanceMap = new InstanceMap(store.content, propertyView, preview);
 
  let dragond;

  // register handler for content changed event
  events.addListener('content-changed', renderPreview);

  // register handler for modules changed event
  events.addListener('modules-changed', renderPreview);

  // register handler for module list changed event
  events.addListener('module-list-changed', moduleListChanged);

  // register handler for instance deleted event
  events.addListener('instance-deleted', instanceDeleted);

  $(init);

  return Object.assign(this, {
    showInstanceControls,
    hideInstanceControls,
    renderPreview,

    // expose the save function to be called by save confirmation modal
    _save,
    
    instanceCommentFilter,
  });

  /**
   * Main initialization function.
   */
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

  /**
   * Handles instance-deleted event.
   * 
   * Renders the whole preview when the content becomes empty.
   */
  function instanceDeleted() {
    if (store.content.isEmpty()) {
      renderPreview();
    }
  }

  /**
   * Initialize route handlers.
   * 
   * Handles route request by showing just the relevant element.
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
    // tell senna to navigate to current path and query params
    // so the handler worked when the user navigated back
    const url = window.location.pathname + window.location.search;
    app.navigate(url);
  }

  /**
   *  Filter parent property to avoid circular reference.
   * 
   *  Used by JSON.stringify()
   */
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

  /**
   * Handles module-list-changed event.
   * 
   * Tell dragond to initialize the new container children for drag operation.
   */
  function moduleListChanged() {
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
}
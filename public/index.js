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
 
  let dragond, 
    usePrecompileParameters = true;

  $(init);

  return Object.assign(this, {
    showInstanceControls,
    hideInstanceControls,

    // expose the save function to be called by save confirmation modal
    _save,
  });

  /**
   * Main initialization function.
   */
  function init() {
    registerHandlers();
    initRoutes();
    initDrag();
    initEditor();
    initInstanceControls();
    initActions();
    loadContent();
  }

  function loadContent() {
    if (query.id) {
      store.content.usePrecompileParameters = usePrecompileParameters;
      store.content.loadContent(query.id, query.precompileParameters);  
    }
  }

  /**
   * Register event handlers.
   */
  function registerHandlers() {
    // register handler for content changed event
    events.addListener('content-changed', renderPreview);

    // register handler for modules changed event
    events.addListener('modules-changed', renderPreview);

    // register handler for global property changed event
    events.addListener('global-property-changed', renderPreview);

    // register handler for module list changed event
    events.addListener('module-list-changed', moduleListChanged);

    // register handler for instance deleted event
    events.addListener('instance-deleted', instanceDeleted);
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

  /**
   * Initialize drag and drop.
   */
  function initDrag() {
    if (dragond) {
      // unregister dragond event handlers
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
          // a new element from module list has been dropped on the preview,
          // create a new instance of the module
          createInstance(el, parent, sibling);
        } else if ($(el).is('.instance') && $(parent).is('.instance-container')) {
          // an instance element has been moved on the preview,
          // sync the movement with the content
          moveInstance(el, parent, src, sibling);
        }
      },
    });

    window.dragond = dragond;
  }

  /**
   * Create a root instance.
   * 
   * @param {element} el - The element that represents the root instance.
   */
  function createFirstInstance(el) {
    const name = $(el).data('name');
    editor.createInstance(name);
    renderPreview();
  } 

  /**
   * Create a child instance.
   * 
   * @param {element} el - The element that represents the instance.
   * @param {element} con - The container element of the instance.
   * @param {element} sibling - The next sibling of the element on the DOM.
   */
  function createInstance(el, con, sibling) {
    const name = $(el).data('name');
    const container = $(con).data('name');
    const parentId = $(con).data('parent-id');
    sibling = new InstanceElement(sibling);
    // create the instance on the content
    const instance = editor.createInstance(name, parentId, container, sibling.id);
    // update data-id attribute with the new id
    $(el).attr('data-id', instance.id);
    // update nested container comments with the new id
    fixContainerComments(el, instance.id);
    // initialize events for this element
    preview.initElement(el);
    // remove default value element from the parent container
    preview.cleanContainer(container, parentId);
  }

  /**
   * Update parent id on container comments.
   * 
   * @param {element} el - Element to use as context.
   * @param {string} parentId - The new parent id.
   */
  function fixContainerComments(el, parentId) {
    $('*', el).contents().filter(domutils.instanceCommentFilter).each(function() {
      this.nodeValue = this.nodeValue.replace(
        /("parentId":\s*)\-?\d+/g, `$1${parentId}`);
    });
  }

  /**
   * Handles instance movement.
   * 
   * @param {element} el - The element that has been moved.
   * @param {element} con - The container of the element.
   * @param {element} src - The source container of the element.
   * @param {element} sibling - The sibling of the element on the DOM.
   */
  function moveInstance(el, con, src, sibling) {
    // move instance on the content
    con = new ContainerElement(con);
    src = new ContainerElement(src);
    el = new InstanceElement(el);
    sibling = new InstanceElement(sibling);
    editor.moveInstance(el.id, con.parentId, con.name, sibling.id);
    // remove default value element on the parent container
    preview.cleanContainer(con.name, con.parentId);
    // render default value element on the source container
    renderContainerChildren(src);
  }

  /**
   * Init toolbar buttons.
   */
  function initActions() {
    $('.save-btn').on('click', save);
    $('.refresh-btn').on('click', refresh);
    $('.precompile-btn').toggleClass('inactive', !usePrecompileParameters)
      .on('click', onPrecompileClick);
  }

  /**
   * Handles precompile button click.
   */
  function onPrecompileClick() {
    togglePrecompile.call(this);
    loadContent();
  }

  /**
   * Toggles precompile and update button state.
   */
  function togglePrecompile() {
    usePrecompileParameters = !usePrecompileParameters;
    $(this).toggleClass('inactive', !usePrecompileParameters);
  }

  /**
   * Init editor panes and buttons.
   */
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

  /**
   * Init instance controls.
   * 
   * This is the toolbar that appeared beside the selected instance.
   */
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

  /**
   * Show instance controls beside the element.
   * 
   * @param {element} el - The instance element.
   */
  function showInstanceControls(el) {
    const rect = el.getBoundingClientRect();
    const pos = domutils.topClientPos(rect.right, rect.top, el.ownerDocument.defaultView);
    // place on the top right corner
    $('.instance-controls').css('left', pos.x +'px')
      .css('top', pos.y+'px').removeClass('hidden');
  }

  /**
   * Hide the instance controls.
   */
  function hideInstanceControls() {
    $('.instance-controls').addClass('hidden');
  }

  /**
   * Handles module-list-changed event.
   * 
   * Tell dragond to initialize the new module items for drag operation.
   */
  function moduleListChanged() {
    // a check is needed in case modules have been fetched before
    // dragond is ready
    dragond && dragond.initContainers();
  }

  /**
   * Render the preview.
   */
  function renderPreview() {
    if (store.content.isEmpty()) {
      // render a container that only accepts root modules
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
   * Render the default element of a container.
   * 
   * When the container becomes empty the default value needs
   * to be rendered again.
   */
  function renderContainerChildren(con) {
    // remove empty container
    con.parentInstance.cleanContainers();
    // render if container is empty
    if (con.parentInstance.getContainers()[con.name].isDefault) {
      preview.renderContainerChildren(con.parentInstance, con.name);
    }
  }

  /**
   * Show the container of the empty content.
   */
  function renderEmptyPreview() {
    $('.empty-container').show();
  }

  /**
   * Hide the container of the empty content.
   */
  function hideEmptyContainer() {
    $('.empty-container').hide();
  }

  /**
   * Handles save button click.
   */
  function save() {
    uiutils.showConfirmModal('Save', 'Save the document?', 'Save', 'app._save()');
  }

  /**
   * Send the document to the backend.
   */
  function _save() {
    const savingToast = uiutils.toast('Saving...', 'info');
    // data to be sent
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
    // remove parent properties
    function filteredContent() {
      return JSON.parse(JSON.stringify(store.content.all(), filterContent));
    }
  }

  /**
   * Render the whole preview on refresh.
   */
  function refresh() {
    // reinitialize drag events
    initDrag();
    renderPreview();
  }
}
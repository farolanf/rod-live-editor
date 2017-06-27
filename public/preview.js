'use strict';

/**
 * Handles the preview pane.
 */
function Preview(propertyView) {

  let iframeWindow;
  let selectedElement;
  let medium;
  let keepSelection;

  events.addListener('instance-changed', renderInstance);
  events.addListener('log-item-clicked', onLogItemClicked);

  events.addListener('module-changed', renderModuleInstances);
  events.addListener('module-property-changed', renderModuleInstances);

  return Object.assign(this, {
    toggleInlineEditing() {toggleInlineEditing(selectedElement)},
    exitInlineEditing() {exitInlineEditing(selectedElement)},
    cloneInstance() {cloneInstance(selectedElement)},
    deleteInstance() {deleteInstance(selectedElement)},
    selectedElement() {return selectedElement},
    renderInstance,
    renderContainerChildren,
    cleanContainer,
    initElement,
    init,
    selectInstanceById,
    scrollToInstance,
  });

  /**
   * Initialize preview.
   * 
   * @param {window} win - The iframe window.
   */
  function init(win) {
    iframeWindow = win;
    initElement(iframeWindow.document.body);
    initEvents(iframeWindow);
    reselectElement();
    injectCss();
  }

  /**
   * Inject preview css.
   */
  function injectCss() {
    $$('head').append('<link href="preview.css" rel="stylesheet">');
  }

  /**
   * Handles log-item-clicked event.
   * 
   * @param {string} id - The clicked instance's id.
   */
  function onLogItemClicked(id) {
    selectInstanceById(id);
    scrollToInstance(id);
  }

  /**
   * Reselect element after reload.
   */
  function reselectElement() {
    if (selectedElement) {
      const id = $(selectedElement).data('id');
      selectInstanceById(id, true);
    }
  }

  /**
   * Init events on the preview iframe window.
   * 
   * @param {window} iframeWindow - The iframe window.
   */
  function initEvents(iframeWindow) {
    $(iframeWindow).off('click scroll').on('click', function(e) {
      deselectInstance(selectedElement);
      selectedElement = null;
      app.hideInstanceControls();
    }).on('scroll', function() {
      // move the controls to the new element position
      if (selectedElement) {
        app.showInstanceControls(selectedElement);
      }
    });
  }

  /**
   * Init container and instance elements.
   * 
   * @param {element} startElement - The element to start searching.
   */
  function initElement(startElement) {
    initContainers(startElement);
    initInstanceElements(startElement);
  }

  /**
   * Init container elements.
   * 
   * Make an element containing container-comment a container.
   * The container-comment contains meta data for a container,
   * it's created by the renderer.
   * 
   * @param {element} startElement - The element to begin searching.
   */
  function initContainers(startElement) {
    const meta = $('*', startElement).contents().filter(domutils.instanceCommentFilter);
    // containers are the comment's parent
    const containers = meta.parent();
    containers.addClass('instance-container');
    // register the containers to dragond
    dragond.addContainers(containers);
    // parse the meta in comment and assign the data to container attributes
    containers.each(function(i) {
      const json = meta[i].nodeValue.replace('instance-container', '');
      const data = JSON.parse(json);
      $(this).attr('data-name', data.name).attr('data-parent-id', data.parentId);
    });
    meta.remove();
  }

  /**
   * Make the children of a container as intances.
   */
  function initInstanceElements(startElement) {
    const childrenSelector = '[data-id]:not(br)';
    if ($(startElement).is('[data-id]')) {
      initInstanceElement(startElement);
    }
    $(childrenSelector, startElement).each(function(i, el) {
      initInstanceElement(el);
    });
  }

  /**
   * Init an instance element.
   */
  function initInstanceElement(el) {
    const visible = $(el).data('visible');
    $(el).addClass('instance')
    .toggleClass('invisible-instance', visible !== true && visible !== 'true')
    .on('click', function(e) {
      e.stopPropagation();
      selectInstance(this);
    })
    .on('blur', function(e) {
      if (!keepSelection) {
        deselectInstance(this);
      }
      keepSelection = false;
    })
    .on('keydown', function(e) {
      if (e.key === 'Escape') {
        exitInlineEditing(this);
      }
    })
    .on('dblclick', function(e) {
      e.stopPropagation();
      enterInlineEditing(this);
    })
    // use mouseover and mouseout for hover styling instead of css :hover
    // to avoid styling parent instance elements
    .on('mouseover', function(e) {
      e.stopPropagation();
      $(this).addClass('hover');
    })
    .on('mouseout', function(e) {
      $(this).removeClass('hover');
    });
  }

  /**
   * Select instance element specified by id.
   * 
   * @param {string} id - The instance id.
   * @param {boolean} noEvent - Don't emit event if true.
   */
  function selectInstanceById(id, noEvent) {
    const el = $$(`[data-id="${id}"]`)[0];
    el && selectInstance(el, noEvent);
  }

  /**
   * Make the element as the selected instance.
   * 
   * Style the element, place the instance controls next to it,
   * and init the property view to show its properties.
   * 
   * @param {element} el - The element.
   * @param {boolean} noEvent - Don't emit event if true.
   */
  function selectInstance(el, noEvent) {
    if (el !== selectedElement) {
      deselectInstance(selectedElement);
    }
    selectedElement = el;
    $(el).addClass('active');
    app.showInstanceControls(el);
    const id = $(el).data('id');
    !noEvent && events.emit('preview-element-selected', id);
  }

  /**
   * Scroll to make the selected instance visible.
   */
  function scrollToInstance(id) {
    const el = $$(`[data-id="${id}"]`)[0];
    scrollToElement(el);
  }

  /**
   * Scroll to make element visible.
   * 
   * @param {element} el - The element.
   */
  function scrollToElement(el) {
    $$('body').scrollTop($(el).offset().top - 100);
  }

  /**
   * Deselect the instance.
   * 
   * @param {element} el - The instance element.
   */
  function deselectInstance(el) {
    if (el) {
      $(el).removeClass('active');
      exitInlineEditing(el);
    }
  }

  /**
   * TODO:
   */
  function exitInlineEditing(el) {
    if (medium) {
      keepSelection = true;
      const value = $(el).text().replace(/^\s+/, ' ').replace(/\s+$/, ' ');
      events.emit('set-instance-property', 'text', value, true);
      medium.destroy();
      medium = null;
      events.emit('exit-inline-editing');
    }
  }

  /**
   * TODO:
   */
  function enterInlineEditing(el) {
    const instanceEl = new InstanceElement(el);
    const instance = new Instance(instanceEl.id);
    if (!medium && instance.getProperties()['inlineEditing'].value === 'true') {
      medium = new MediumEditor(el);
      events.emit('enter-inline-editing');
    }
  }

  function toggleInlineEditing(el) {
    if (medium) {
      exitInlineEditing(el);
    }
    else {
      enterInlineEditing(el);
    }
  }

  /**
   * Clone an instance element.
   * 
   * The clone will be placed as it next sibling.
   * 
   * @param {element} el - The element.
   */
  function cloneInstance(el) {
    const clone = $(el).clone().insertAfter(el);
    initElement(clone);
    deselectInstance(clone);
    const id = $(el).data('id');
    editor.cloneInstance(id);
    selectInstance($$(`[data-id=${id}]`)[0]);
  }

  /**
   * Delete the element and the referenced module instance.
   * 
   * @param {element} el - The element of the instance.
   */
  function deleteInstance(el) {
    const con = $(el).closest('.instance-container');
    const conel = new ContainerElement(con);
    const id = $(el).data('id');
    editor.removeInstance(id);
    $(el).remove();
    // clean the container this instance belong, if it's become
    // empty then it should render the default value
    if (conel.parentInstance) {
      conel.parentInstance.cleanContainers();
      renderContainerChildren(conel.parentInstance, conel.name);
    }
    app.hideInstanceControls();
    events.emit('instance-deleted', id);
  }

  /**
   * Render an instance.
   * 
   * This will replace the instance element currently showing
   * on the preview.
   * 
   * @param {object} instance - The instance object.
   */
  function renderInstance(instance) {
    if (medium) {
      return;
    }
    const html = instance.render();
    const prev = $$(`[data-id="${instance.id}"]`);
    dragond.removeFoundContainers(prev[0]);
    replaceElement(prev, html);
  }

  function renderModuleInstances(name) {
    if (!isContentEditor) {
      return;
    }
    $$(`[data-name="${name}"]`).each(function() {
      const id = $(this).data('id');
      const instance = new Instance(id);
      renderInstance(instance);
    });
  }

  /**
   * Replace element content to the given html.
   * 
   * If the element is a root html instance then preview.css needs
   * to be injected again.
   * 
   * @param {jquery element} prev - The element.
   * @param {string} html - The new HTML code.
   */
  function replaceElement(prev, html) {
    if (prev.find('head, body').length > 0) {
      if (prev.find('head').length > 0) {
        // replace only the content of the head to avoid issue on
        // replacing the whole head element
        const head = html.replace(/[^]*<head[^]*?>([^]*)<\/head>[^]*/, '$1');
        prev.find('head').replaceWith($('<head>').html(head));
        $$('head').append('<link href="preview.css" rel="stylesheet">');
      } 
      if (prev.find('body').length > 0) {
        // replace only the content of the body to avoid issue on
        // replacing the whole body element
        const prevBody = prev.find('body')[0];
        const body = html.replace(/[^]*<body[^]*?>([^]*)<\/body>[^]*/, '$1');
        prev.find('body').replaceWith($('<body>').html(body));
        // TODO: replace body attributes
        const el = prev.find('body')[0];
        dragond.replaceBody(prevBody, el);
        initElement(el);
      }
    } else {
      // just replace the whole element for non html element
      const el = $(html);
      prev.replaceWith(el);
      initElement(el);
      if (prev.is(selectedElement)) {
        selectInstance(el[0]);
      }
    }
  }

  /**
   * Render the default value of a container without meta.
   * 
   * @param {object} instance - The instance object.
   * @param {string} name - The container name.
   */
  function renderContainerChildren(instance, name) {
    // only render if it's empty
    if (instance.getContainers()[name].isDefault) {
      const el = $(instance.renderContainerChildren(name));
      const con = $$(`[data-name="${name}"][data-parent-id="${instance.id}"]`);
      con.append(el);
      initElement(el);
      const meta = $(con).contents().filter(domutils.instanceCommentFilter);
      meta.remove();
    }
  }

  /**
   * Remove default value element from a container element.
   */
  function cleanContainer(name, parentId) {
    $$(`.instance-container[data-name="${name}"][data-parent-id="${parentId}"]`)
      .children().not('[data-id]').remove();
  }

  /**
   * Shortcut for jQuery that operates on current iframe.
   */
  function $$(selector) {
    return $(selector, iframeWindow.document);
  }
}
'use strict';

new Preview();

function Preview() {
  const editor = window.parent.editor;
  const propertyView = window.parent.propertyView;
  const app = window.parent.app;
  const dragond = window.parent.dragond;

  const SCROLL_SPEED = 1000; // pixels per second
  let selectedElement;

  app.preview = {
    editInstanceContent() {editInstanceContent(selectedElement)},
    cloneInstance() {cloneInstance(selectedElement)},
    deleteInstance() {deleteInstance(selectedElement)},
    renderInstance,
    renderContainerChildren,
    cleanContainer,
    initElement,
  };

  $(window).on('click', function(e) {
    deselectInstance(selectedElement);
    selectedElement = null;
    app.hideInstanceControls();
  }).on('scroll', function() {
    if (selectedElement) {
      app.showInstanceControls(selectedElement);
    }
  });

  $(init);

  function init() {
    initElement('body');
  }

  function initElement(startElement) {
    initContainers(startElement);
    initInstanceElements(startElement);
  }

  function initContainers(startElement) {
    const meta = $('*', startElement).contents().filter(instanceCommentFilter);
    const containers = meta.parent();
    containers.addClass('instance-container');
    dragond.addContainers(containers);
    containers.each(function(i) {
      const json = meta[i].nodeValue.replace('instance-container', '');
      const data = JSON.parse(json);
      $(this).attr('data-name', data.name).attr('data-parent-id', data.parentId);
    });
  }

  function instanceCommentFilter() {
    return this.nodeType === 8 && this.nodeValue.includes('instance-container');
  }

  function initInstanceElements(startElement) {
    const childrenSelector = '.instance-container > [data-id]:not(br)';
    if ($(startElement).is('[data-id]')) {
      initInstanceElement(startElement);
    }
    $(childrenSelector, startElement).each(function(i, el) {
      initInstanceElement(el);
    });
  }

  function initInstanceElement(el) {
    $(el).addClass('instance').on('click', function(e) {
      e.stopPropagation();
      if (this !== selectedElement) {
        deselectInstance(selectedElement);
      }
      selectInstance(this);
    })
    .on('blur', function(e) {
      deselectInstance(this);
    })
    .on('dblclick', function(e) {
      e.stopPropagation();
      editInstanceContent(this);
    })
    .on('mouseover', function(e) {
      e.stopPropagation();
      $(this).addClass('hover');
    })
    .on('mouseout', function(e) {
      $(this).removeClass('hover');
    });
  }

  function selectInstance(el) {
    selectedElement = el;
    $(el).addClass('active');
    app.showInstanceControls(el);
    const id = $(el).data('id');
    propertyView.setInstance(id);
  }

  function deselectInstance(el) {
    $(el).removeClass('active').attr('contenteditable', false);
  }

  function stopContentEditing() {
    $('[contenteditable="true"]').attr('contenteditable', false);
  }

  function editInstanceContent(el) {
    $(el).attr('contenteditable', true);
    setTimeout(function() {
      $(el).focus();
    });
  }

  function cloneInstance(el) {
    const clone = $(el).clone().insertAfter(el);
    initElement(clone);
    deselectInstance(clone);
    const id = $(el).data('id');
    editor.cloneInstance(id);
    app.renderPreview();
    selectInstance($(`[data-id=${id}]`)[0]);
  }

  function deleteInstance(el) {
    const id = $(el).data('id');
    editor.removeInstance(id);
    $(el).remove();
    app.hideInstanceControls();
  }

  function renderInstance(instance) {
    const html = instance.render();
    const prev = $(`[data-id="${instance.id}"]`);
    dragond.removeFoundContainers(prev[0]);
    replaceElement(prev, html);
  }

  function replaceElement(prev, html) {
    if (prev.find('head, body').length > 0) {
      if (prev.find('head').length > 0) {
        const head = html.replace(/[^]*<head[^]*?>([^]*)<\/head>[^]*/, '$1');
        prev.find('head').replaceWith($('<head>').html(head));
        $('head').append('<link href="preview.css" rel="stylesheet">');
      } 
      if (prev.find('body').length > 0) {
        const prevBody = prev.find('body')[0];
        const body = html.replace(/[^]*<body[^]*?>([^]*)<\/body>[^]*/, '$1');
        prev.find('body').replaceWith($('<body>').html(body));
        const el = prev.find('body')[0];
        dragond.replaceBody(prevBody, el);
        initElement(el);
        $('body').append(`
          <script src="https://code.jquery.com/jquery-3.1.1.min.js" integrity="sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8=" crossorigin="anonymous"></script>
          <script src="preview.js"></script>
        `);
      }
    } else {
      const el = $(html);
      prev.replaceWith(el);
      initElement(el);
      if (prev.is(selectedElement)) {
        selectInstance(el[0]);
      }
    }
  }

  function renderContainerChildren(instance, name) {
    const el = $(instance.renderContainerChildren(name));
    $(`[data-name="${name}"][data-parent-id="${instance.id}"]`).append(el);
    initElement(el);
  }

  function cleanContainer(name, parentId) {
    $(`.instance-container[data-name="${name}"][data-parent-id="${parentId}"]`)
      .children().not('[data-id]').remove();
  }
}
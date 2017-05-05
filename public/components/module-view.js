'use strict';

/**
 * Handles module view.
 * 
 * @param {object} store - The store.
 * @param {string} initialGroup - The initial module group to be used.
 */
function ModuleView(store, initialGroup) {

  const modules = store.modules;

  events.addListener('activate-content-editor', render);
  events.addListener('activate-module-editor', render);
  events.addListener('module-changed', render);

  init();

  return Object.assign(this, {
    getElement,
  });

  /**
   * Main initialization.
   * 
   * @private
   */
  function init() {
    initSearch();
    fillGroups();
  }

  /**
   * Render current group.
   */
  function render() {
    fillModuleList(store.modules.modules());    
  }

  /**
   * Initialize search box.
   * 
   * @private
   */
  function initSearch() {
    $('.module-view .module-search').on('keyup', function(e) {
      if (e.key === 'Escape') {
        e.target.value = '';
      }
      filterModules(e.target.value);
    });
  }

  /**
   * Show modules that matched the specified string.
   * 
   * @private
   */
  function filterModules(str) {
    $('.module-view .list-group-item').each(function() {
      // match if string contained in module name
      const match = !str || $(this).is(`[data-name*="${str}"]`);
      $(this).toggleClass('hidden', !match);
    });
  }

  /**
   * Fill the module group choices.
   * 
   * @private
   */
  function fillGroups() {
    modules.loadGroups(function(groups) {
      groups.forEach(function(group) {
        $('.module-view .module-groups')
          .append(`<option value="${group}">${group}</option`);
      });
      $('.module-view .module-groups').on('change', function() {
        const name = $(this).find(':selected').val();
        fillModules(name);
      });
      if (initialGroup) {
        $('.module-view .module-groups').val(initialGroup);  
      }
      $('.module-view .module-groups').trigger('change');
    });
  }

  /**
   * Load modules from the specified group.
   * 
   * @param {string} name - The module group name.
   * @private
   */
  function fillModules(name) {
    modules.loadGroupModules(name, function(data) {
      fillModuleList(data);
    });
  }

  /**
   * Fill the list with modules from the specified group.
   * 
   * @param {object} modules - The modules object.
   * @private
   */
  function fillModuleList(modules) {
    const $list = $('<div class="list-group">');
    _.forOwn(modules, function(val, key) {
      const $item = $(`<div class="list-group-item" data-name="${key}">`);
      $item.append(`<div class="module-name">${key}</div>`);
      $item.append(getPreview(key));
      $list.append($item);
    });
    $('.module-view .module-list').html($list.html());
    $('.module-view .list-group-item').popover({
      trigger: 'hover',
      placement: 'right',
      html: true,
      title: function() {return $(this).data('name')},
      content: function() {return getPreview($(this).data('name'), true)},
    }).on('click dragstart', function() {
      $(this).popover('hide');
    });
    $('.module-view .list-group-item').on('click', onItemClick);
    events.emit('module-list-changed');
  }

  /**
   * Handles module item click.
   */
  function onItemClick() {
    const name = $(this).data('name');
    if (!isContentEditor) {
      store.content.setContent({name});
    }
    events.emit('module-selected', name);
  }

  /**
   * Get the module preview.
   * 
   * @param {string} name - The module name.
   * @param {boolean} large - Get the large preview if true.
   * @return {string} - The preview HTML.
   * @private
   */
  function getPreview(name, large) {
    Editor.useWrapper = true;
    const renderer = store.createRenderer(app.getLanguage());
    const style = large ? 'style="width: 800px; height: 600px"' : '';
    const html = `
      <html>
        <body style="text-align: center">
          ${renderer.renderModule({name})}
        </body>
      </html>
    `;
    const $iframe = $(`<iframe ${style}>`);
    $iframe.attr('srcdoc', html);
    return $iframe;
  }

  /**
   * Get the real module element that will be placed on the preview pane.
   * 
   * @param {element} el - The dragged module preview element.
   * @return {element} - The element to be placed.
   * @public
   */
  function getElement(el) {
    Editor.useWrapper = false;
    const renderer = store.createRenderer(app.getLanguage());
    // extract data from the preview element
    const name = $(el).data('name');
    const content = {name: name, id: -1};
    let html = renderer.renderModule(content);
    // check if it's an HTML element
    if (/<html[^<]*>/.test(html)) {
      // a html element can't be dragged around so use a placeholder
      // this later will be replaced when it's dropped
      html = `<span data-id data-name="${name}" data-root>HTML Document</span>`;  
    }
    return $(html)[0];
  }
}
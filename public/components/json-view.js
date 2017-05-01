
/**
 * Handles JSON view.
 * 
 * @param {object} content - The content store.
 */
function JsonView(content) {

  let readOnly, acedit, moduleName;
  let js = true;//$('.json-view .json-js-btn').is('.active');
  $('.json-view .json-js-btn').hide();

  $('.json-view .modal-close-btn').on('click', hide);
  $('.json-view .json-save-btn').on('click', save);
  $('.json-view .json-js-btn').on('click', onToggleFormat);

  acedit = ace.edit('content-json');
  acedit.setAutoScrollEditorIntoView(true);
  acedit.setFontSize(14);
  acedit.getSession().setMode('ace/mode/javascript');
  acedit.getSession().setUseWrapMode(true);

  acedit.on('change', setDirty);

  events.addListener('activate-content-editor', function() {
    $('.json-view .modal-close-btn').show();
    $('.json-view .json-save-btn').removeAttr('data-toggle').removeAttr('title');
    resize();
  });

  events.addListener('activate-module-editor', function() {
    $('.json-view .modal-close-btn').hide();
    $('.json-view .json-save-btn').attr('data-toggle', 'tooltip')
      .attr('title', 'Save to preview changes').tooltip();
    $('#json-view__module-file').text('');
    resize();
  });

  events.addListener('module-selected', onModuleSelected);
  events.addListener('module-property-changed', show.bind(null, false));

  return Object.assign(this, {
    show,
    resize,
    clear,
  });

  /**
   * Clear ace editor.
   */
  function clear() {
    acedit.setValue('');
    acedit.setReadOnly(true);
    disableSave();
  }

  /**
   * Get the edited module.
   * 
   * @return {object} - The module.
   */
  function getModule() {
    return store.modules.modules()[moduleName];
  }

  /**
   * Handles module-selected event.
   * 
   * @param {string} name - The name of the selected module.
   */
  function onModuleSelected(name) {
    moduleName = name;
    $('#json-view__module-file').text(`Apply changes to ${store.modules.group()}/${name}.js to make changes permanent.`);
    show(false);
  }

  /**
   * Resize the ace editor.
   */
  function resize() {
    acedit.resize();
  }

  /**
   * Toggle between JSON and JS format.
   */
  function onToggleFormat() {
    if (isDirty() && js) {
      events.removeListener('switch-to-json', toggleFormat);
      events.once('switch-to-json', toggleFormat);
      uiutils.showConfirmModal('Switch to JSON', 'Changes will be discarded, proceed?', 'Proceed', 'events.emit("switch-to-json")', 'danger');
    }
    else {
      toggleFormat();
    }
  }

  /**
   * Toggle js or json format.
   */
  function toggleFormat() {
    js = !js;
    const btn = $('.json-view .json-js-btn');
    btn.toggleClass('active', js);
    btn.text(js ? 'JS' : 'JSON');
    const mode = js ? 'javascript' : 'json';
    acedit.getSession().setMode(`ace/mode/${mode}`);
    load(js);
  }

  /**
   * Enable save button.
   */
  function enableSave() {
    $('.json-view .json-save-btn').removeClass('disabled');
  }

  /**
   * Disable save button.
   */
  function disableSave() {
    $('.json-view .json-save-btn').addClass('disabled');
  }

  /**
   * Enable save button.
   */
  function setDirty() {
    enableSave();
  }

  /**
   * Get changed status.
   */
  function isDirty() {
    return !$('.json-view .json-save-btn').is('.disabled');
  }

  /**
   * Get editor value between parentheses if any.
   * 
   * @return {string} - The value between parentheses or the original value.
   */
  function getValue() {
    return acedit.getValue().replace(/^\(([^]*)\)$/, '$1');    
  }

  /**
   * Get the content or current module definition.
   * 
   * @param {boolean} js - Get the javascript if true, otherwise json.
   */
  function getContent(js) {
    if (isContentEditor) {
      // enclose js with parenthesis to fix ace syntax error
      return js ? `(${content.getJs()})` : content.getJSON();
    }
    else {
      const json = contentUtils.getJSON(getModule());
      return js ? `(${contentUtils.toJs(json)})` : json;
    }
  }

  /**
   * Load content JSON onto editor.
   * 
   * @param {boolean} js - Format in javascript if true else json.
   */
  function load(js) {
    acedit.setValue(getContent(js));
    acedit.getSession().getSelection().clearSelection();
    acedit.getSession().setScrollTop(0);
    acedit.setReadOnly(readOnly || !js);
    $('.json-view .json-save-btn').addClass('disabled');
  }

  /**
   * Save the JSON to content and disable save button.
   */
  function save() {
    if (isContentEditor) {
      undo.push();
      content.fromJSON(getValue());
    }
    else {
      eval(`store.modules.modules()[moduleName] = ${getValue()}`);
      events.emit('module-changed');      
    }
    disableSave();
  }

  /**
   * Show the JSON view.
   */
  function show(_readOnly) {
    readOnly = _readOnly;
    $('.json-view .json-save-btn').toggleClass('hidden', readOnly);
    load($('.json-js-btn').is('.active'));
    $('.json-view').show();
  }

  /**
   * Hide the JSON view.
   */
  function hide() {
    $('.json-view').hide();
  }
}
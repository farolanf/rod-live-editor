
/**
 * Handles JSON view.
 * 
 * @param {object} content - The content store.
 */
function JsonView(content) {

  let readOnly;
  let js = $('.json-view .json-js-btn').is('.active');

  const acedit = ace.edit('content-json');
  acedit.setFontSize(14);
  acedit.getSession().setMode('ace/mode/javascript');
  acedit.getSession().setUseWrapMode(true);

  acedit.on('change', setDirty);

  $('.json-view .modal-close-btn').on('click', hide);
  $('.json-view .json-save-btn').on('click', save);
  $('.json-view .json-js-btn').on('click', onToggleFormat);

  return Object.assign(this, {
    show,
  });

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
  function setDirty() {
    $('.json-view .json-save-btn').removeClass('disabled');
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
   * Load content JSON onto editor.
   * 
   * @param {boolean} js - Format in javascript if true else json.
   */
  function load(js) {
    // enclose js with parenthesis to fix ace syntax error
    const str = js ? `(${content.getJs()})` : content.getJSON();
    acedit.setValue(str);
    acedit.getSession().getSelection().clearSelection();
    acedit.getSession().setScrollTop(0);
    acedit.setReadOnly(readOnly || !js);
    $('.json-view .json-save-btn').addClass('disabled');
  }

  /**
   * Save the JSON to content and disable save button.
   */
  function save() {
    undo.push();
    content.fromJSON(getValue());
    $('.json-view .json-save-btn').addClass('disabled');
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
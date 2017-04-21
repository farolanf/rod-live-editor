
/**
 * Handles JSON view.
 * 
 * @param {object} content - The content store.
 */
function JsonView(content) {

  const acedit = ace.edit('content-json');
  acedit.setFontSize(14);
  acedit.getSession().setMode('ace/mode/javascript');
  acedit.getSession().setUseWrapMode(true);

  acedit.on('change', setDirty);

  $('.json-view .modal-close-btn').on('click', hide);
  $('.json-view .json-save-btn').on('click', save);
  $('.json-view .json-js-btn').on('click', jsonJsToggle);

  return Object.assign(this, {
    show,
  });

  /**
   * Toggle between JSON and JS format.
   */
  function jsonJsToggle() {
    const btn = $(this);
    // active need to be inversed because it's reading the old state
    const active = !btn.is('.active');
    const mode = active ? 'javascript' : 'json';
    btn.text(active ? 'JS' : 'JSON');
    acedit.getSession().setMode(`ace/mode/${mode}`);
    load(active);
  }

  /**
   * Enable save button.
   */
  function setDirty() {
    $('.json-view .json-save-btn').removeClass('disabled');
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
    acedit.setReadOnly(!js);
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
  function show() {
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
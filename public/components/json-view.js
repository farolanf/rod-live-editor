
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

  return Object.assign(this, {
    show,
  });

  /**
   * Enable save button.
   */
  function setDirty() {
    $('.json-view .json-save-btn').removeClass('disabled');
  }

  /**
   * Load content JSON onto editor.
   */
  function load() {
    acedit.setValue(content.getJSON());
    acedit.getSession().getSelection().clearSelection();
    acedit.getSession().setScrollTop(0);
    $('.json-view .json-save-btn').addClass('disabled');
  }

  /**
   * Save the JSON to content and disable save button.
   */
  function save() {
    undo.push();
    content.fromJSON(acedit.getValue());
    $('.json-view .json-save-btn').addClass('disabled');
  }

  /**
   * Show the JSON view.
   */
  function show() {
    load();
    $('.json-view').show();
  }

  /**
   * Hide the JSON view.
   */
  function hide() {
    $('.json-view').hide();
  }
}
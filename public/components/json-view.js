'use strict';

/**
 * JsonView core functionality.
 */
class JsonView {

  constructor(selector) {
    this.selector = selector;
    $('.json-save-btn', selector).on('click', this.save.bind(this));
    $('.modal-close-btn', selector).on('click', this.hide.bind(this));
    this.initAce();
  }

  initAce() {
    this.editorId = $('.panel-body > *', this.selector).prop('id');
    const acedit = ace.edit(this.editorId);
    acedit.setAutoScrollEditorIntoView(true);
    acedit.setFontSize(14);
    acedit.getSession().setMode('ace/mode/javascript');
    acedit.getSession().setUseWrapMode(true);
    acedit.on('change', this.setDirty.bind(this));
    this.acedit = acedit;
  }

  /**
   * Clear ace editor.
   */
  clear() {
    this.acedit.setValue('');
    this.acedit.setReadOnly(true);
    this.disableSave();
  }

  /**
   * Resize the ace editor.
   */
  resize() {
    this.acedit.resize();
  }

  /**
   * Enable save button.
   */
  enableSave() {
    $('.json-save-btn', this.selector).removeClass('disabled');
  }

  /**
   * Disable save button.
   */
  disableSave() {
    $('.json-save-btn', this.selector).addClass('disabled');
  }

  /**
   * Enable save button.
   */
  setDirty() {
    this.enableSave();
  }

  /**
   * Disable save button. 
   */
  save() {
    this.disableSave();
  }

  /**
   * Get editor value between parentheses if any.
   * 
   * @return {string} - The value between parentheses or the original value.
   */
  getValue() {
    return this.acedit.getValue().replace(/^\(([^]*)\)$/, '$1');    
  }

  /**
   * Load content JSON onto editor.
   */
  load(readOnly) {
    this.acedit.setValue(this.getContent());
    this.acedit.getSession().getSelection().clearSelection();
    this.acedit.getSession().setScrollTop(0);
    this.acedit.setReadOnly(readOnly);
    $('.json-save-btn', this.selector).addClass('disabled');
  }

  /**
   * Show the JSON view.
   */
  show() {
    $(this.selector).show();
  }

  /**
   * Hide the JSON view.
   */
  hide() {
    $(this.selector).hide();
  }
}

class ContentJsonView extends JsonView {

  /**
   * Save the JSON to content and disable save button.
   */
  save() {
    undo.push();
    store.content.fromJSON(this.getValue());
    super.save();
  }

  /**
   * Get the content.
   */
  getContent() {
    // enclose js with parenthesis to fix ace syntax error
    return `(${store.content.getJs()})`;
  }

  /**
   * Load and show the view.
   * 
   * @param {boolean} readOnly - Read only if true.
   */
  show(readOnly) {
    super.load(readOnly);
    super.show();
  }
}

class ModuleJsonView extends JsonView {

  constructor(selector) {
    super(selector);
    this.moduleName = null;
    events.addListener('module-selected', this.onModuleSelected.bind(this));
    events.addListener('module-property-changed', this.load.bind(this, false));
  }

  /**
   * Save the JSON to content and disable save button.
   */
  save() {
    eval(`store.modules.modules()[this.moduleName] = ${this.getValue()}`);
    events.emit('module-changed', this.moduleName);      
    super.save();
  }

  /**
   * Get the edited module.
   * 
   * @return {object} - The module.
   */
  getModule() {
    return store.modules.modules()[this.moduleName];
  }

  /**
   * Handles module-selected event.
   * 
   * @param {string} name - The name of the selected module.
   */
  onModuleSelected(name) {
    this.moduleName = name;
    $('.json-view__module-name').text(name);
    $('.json-view__module-file').text(`${store.modules.group()}/${name}.js`);
    this.load(false);
    this.show();
  }

  /**
   * Get current module definition.
   */
  getContent() {
    const json = contentUtils.getJSON(this.getModule());
    return `(${contentUtils.toJs(json)})`;
  }

  show() {
    if (this.split) {
      return;
    }
    this.split = Split(['.preview', '.module-json-view'], {
      sizes: [50, 50],
      minSize: 0,
      direction: 'vertical',
      onDragEnd: this.resize.bind(this),
    });
    super.show();
  }

  hide() {
    this.split.destroy();
    this.split = null;
  }
}

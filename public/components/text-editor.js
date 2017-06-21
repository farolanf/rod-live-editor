'use strict';

/**
 * Text property editor.
 */
class TextEditor extends EventEmitter {

  constructor(modalId, editorId, mode) {
    super();
    this.modalId = modalId;
    
    const acedit = ace.edit(editorId);
    acedit.setFontSize(14);
    acedit.getSession().setMode(mode);
    acedit.getSession().setUseWrapMode(true);
    this.aceEditor = acedit;

    const me = this;
    $('#'+modalId).on('shown.bs.modal', function() {
      me._setEditorValue();
    }).on('hide.bs.modal', function() {
      me._onHide();
    });
  }

  setValue(value) {
    this.value = value;
  }

  setOnChangeHandler(fn) {
    this.removeEvent('hide').addListener('hide', fn);
  }

  show() {
    $('#'+this.modalId).modal();
  }

  _setEditorValue() {
    let value = this.value;
    if (typeof value === 'object') {
       value = value[app.getLanguage()];
    }
    value = value || '';
    this.aceEditor.setValue(value);
  }

  _onHide() {
    this.emit('hide', this.aceEditor.getValue());
  }
}
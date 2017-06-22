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
      me._initLanguages();
    }).on('hide.bs.modal', function() {
      me._onHide();
    });

    // update more options caret
    $(`#${modalId}__more-options`).on('show.bs.collapse', function() {
      $(`#${modalId} .more-options-btn i`).toggleClass('fa-caret-right', false).toggleClass('fa-caret-down', true);
    }).on('hide.bs.collapse', function() {
      $(`#${modalId} .more-options-btn i`).toggleClass('fa-caret-right', true).toggleClass('fa-caret-down', false);
    });

    // language copy
    events.addListener('copy-language-value', this._copyLanguageValue.bind(this));

    $(`#${modalId} .language-copy-btn`).on('click', function() {
      uiutils.showConfirmModal('Copy Language Value', 'Overwrite editor content with current language value?', 'Overwrite', 'events.emit("copy-language-value")', 'danger');
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

  _copyLanguageValue() {
    const value = $(`#${this.modalId}__language-value`).text();
    this.aceEditor.setValue(value);
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

  _initLanguages() {
    $(`#${this.modalId} .more-options-btn`).toggleClass('hidden', app.getLanguages().length <= 0);
    if (!this.selectedLang) {
      this.selectedLang = app.getLanguage();
    }
    $(`#${this.modalId}__selected-language`).text(this.selectedLang);
    const me = this;
    const ul = $(`#${this.modalId}__language-select-btn + .dropdown-menu`);
    ul.html('');
    app.getLanguages().forEach(function(val) {
      ul.append(`<li class="${val === me.selectedLang ? 'active' : ''}"><a>${val}</a></li>`);
    });
    $('li', ul).on('click', function() {
      me.selectedLang = $('a', this).text();
      me._onLanguageChanged(me.selectedLang);
      me._initLanguages();      
    });
    me._onLanguageChanged(this.selectedLang);
  }

  _onLanguageChanged(lang) {
    const value = this.value[lang] || '';
    $(`#${this.modalId}__language-value`).text(value);
  }
}
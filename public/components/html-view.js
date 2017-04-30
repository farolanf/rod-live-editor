
/**
 * Handles HTML view.
 */
function HtmlView() {

  $('.html-view .modal-close-btn').on('click', hide);

  const acedit = ace.edit('rendered-html');
  acedit.setAutoScrollEditorIntoView(true);
  acedit.setFontSize(14);
  acedit.getSession().setMode('ace/mode/html');
  acedit.getSession().setUseWrapMode(true);
  acedit.getSession().setTabSize(2);
  acedit.setReadOnly(true);


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
  }

  /**
   * Resize the ace editor.
   */
  function resize() {
    acedit.resize();
  }

  /**
   * Load content onto editor.
   */
  function load() {
    if (store.content.isEmpty() || store.modules.isEmpty()) {
      clear();
      return;
    }
    const str = store.createRenderer(app.getLanguage())
      .render(store.content.content());
    acedit.setValue(str);
    acedit.getSession().getSelection().clearSelection();
    acedit.getSession().setScrollTop(0);
  }

  /**
   * Show the view.
   */
  function show() {
    load();
    $('.html-view').show();
  }

  /**
   * Hide the view.
   */
  function hide() {
    $('.html-view').hide();
  }
}
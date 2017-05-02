
/**
 * Handles errors view.
 */
function ErrorsView() {
  events.addListener('errors-changed', onErrorsChanged);
  events.addListener('warnings-changed', onErrorsChanged);

  initLogButton();
  return;

  /**
   * Initialize the log button.
   */
  function initLogButton() {
    $('.property-view .log-btn').on('click', function() {
      $('.property-view .property-list').hide();
      $('.property-view .errors-log').show();
    });
  }

  /**
   * Handles errors-changed and warnings-changed events.
   * 
   * Show errors pane on errors or warnings.
   */
  function onErrorsChanged() {
    const show = !log.empty();
    $('.property-view .log-btn').toggleClass('hidden', !show);
    !show && events.emit('show-property-list');
    show && render();
  }

  /**
   * Render errors list.
   */
  function render() {
    const html = log.errors().map(function(err) {
      const data = err.instanceId ? `data-instance-id="${err.instanceId}"` : '';
      return `<div class="error-item" ${data}>${wrapVars(err.msg)}</div>`;
    }).join('') + log.warnings().map(function(warn) {
      const data = warn.instanceId ? `data-instance-id="${warn.instanceId}"` : '' +
        warn.property ? `data-property="${warn.property}"` : '';
      return `<div class="warning-item" ${data}>${wrapVars(warn.msg)}</div>`;
    }).join('');
    $('.property-view .errors-log').html(html);
    $('.property-view [data-instance-id]').css('cursor', 'pointer')
    .on('click', function() {
      const instanceId = $(this).data('instance-id');
      events.emit('log-item-clicked', instanceId);
    });
    
    /**
     * Wrap important words in an error/warning message.
     * 
     * @param {string} str - The message containing quoted variables.
     * @return {string} - The str with wrapped variables.
     */
    function wrapVars(str) {
      return str.replace(/'([^]+?)'/g, '<span class="error-variable">$1</span>');
    }
  }
}
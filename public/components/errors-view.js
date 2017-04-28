
function ErrorsView() {
  events.addListener('errors-changed', onErrorsChanged);

  initLogButton();
  return;

  function initLogButton() {
    $('.property-view .log-btn').on('click', function() {
      $('.property-view .property-list').hide();
      $('.property-view .errors-log').show();
    });
  }

  function onErrorsChanged() {
    const hasError = log.hasError();
    $('.property-view .log-btn').toggleClass('hidden', !hasError);
    !hasError && events.emit('show-property-list');
    render();
  }

  function render() {
    const html = log.errors().map(function(err) {
      const data = err.instanceId ? `data-instance-id="${err.instanceId}"` : '';
      return `<div class="error-item" ${data}>${err.msg}</div>`;
    }).join('');
    $('.property-view .errors-log').html(html);
    $('.property-view [data-instance-id]').css('cursor', 'pointer')
    .on('click', function() {
      const instanceId = $(this).data('instance-id');
      events.emit('select-instance-by-id', instanceId);
    });
  }
}
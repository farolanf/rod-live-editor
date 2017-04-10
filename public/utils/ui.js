
function UIUtils() {

  this.toast = function(msg, type) {
    const colors = {
      info: '#039be5',
      error: '#ef5350',
    };
    return $.toast({
      text: msg,
      position: 'top-right',
      bgColor: colors[type || 'info'],
    });
  };

  this.showConfirmModal = function(title, msg, actionTitle, onclick, type) {
    const modal = $('#confirm-modal');
    $('.modal-title', modal).text(title);
    $('.confirm-msg', modal).text(msg);
    $('[data-primary-btn]', modal).text(actionTitle).attr('onclick', onclick);
    if (type === 'danger') {
      $('[data-primary-btn]', modal).removeClass('btn-primary').addClass('btn-danger');
    }
    else {
      $('[data-primary-btn]', modal).removeClass('btn-danger').addClass('btn-primary');
    }
    modal.modal();
  };
};
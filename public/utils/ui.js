
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

  this.showConfirmModal = function(title, msg, actionTitle, onclick) {
    const modal = $('#confirm-modal');
    $('.modal-title', modal).text(title);
    $('.confirm-msg', modal).text(msg);
    $('.btn-primary', modal).text(actionTitle).attr('onclick', onclick);
    modal.modal();
  };
};
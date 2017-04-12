
function UIUtils() {

  /**
   * Show a toast.
   * 
   * @param {string} msg - The message to be displayed.
   * @param {string} type - The type of message <info|error>.
   */
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

  /**
   * Show a confirmation modal.
   * 
   * @param {string} title - The modal title.
   * @param {string} msg - The message.
   * @param {string} actionTitle - The primary button title.
   * @param {string} onclick - The code to be executed on click.
   * @param {string} type - Type of message <undefined|danger>.
   */
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
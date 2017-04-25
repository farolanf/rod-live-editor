
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
  this.showConfirmModal = function(title, body, actionTitle, onclick, type, 
  actionTitle2, onclick2, type2) {
    const modal = $('#confirm-modal');
    $('.modal-title', modal).text(title);
    $('.modal-body', modal).html(body);
    $('[data-primary-btn]', modal).text(actionTitle).attr('onclick', onclick);
    if (type === 'danger') {
      $('[data-primary-btn]', modal).removeClass('btn-primary').addClass('btn-danger');
    }
    else {
      $('[data-primary-btn]', modal).removeClass('btn-danger').addClass('btn-primary');
    }
    const btn3 = $('[data-third-btn]', modal);
    btn3.toggleClass('hidden', !actionTitle2);
    if (!!actionTitle2) {
      btn3.text(actionTitle2).attr('onclick', onclick2)
        .toggleClass('btn-primary', type2 === 'primary')
        .toggleClass('btn-danger', type2 === 'danger')
        .toggleClass('btn-success', type2 === 'success');
    }
    modal.modal();
  };
};
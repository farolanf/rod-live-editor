
$(init);

function init() {
  $('body iframe').attr('srcdoc', render(content));
}
'use strict';

function ModuleView(modules, renderer) {

  init();

  return Object.assign(this, {
    getElement,
  });

  function init() {
    const $list = $('<div class="list-group">');
    _.forOwn(modules, function(val, key) {
      const content = {name: key};
      const body = renderer.renderModule(content);
      const html = body.includes('</html>') ? body : 
        ` <html>
            <body>
              ${body}
            </body>
          </html>
        `;
      const iframe = $('<iframe>');
      iframe.attr('srcdoc', html);

      const $item = $(`<div class="list-group-item" data-name="${key}">`);
      $item.append(`<div class="module-name">${key}</div>`);
      $item.append(iframe);

      $list.append($item);
    });
    $('.module-view .module-list').html($list.html());
    $('.module-view .list-group-item').popover({
      trigger: 'hover',
      placement: 'right',
      html: true,
      title: function() {return $(this).data('name')},
      content: function() {return getPreview(this)},
    }).on('click dragstart', function() {
      $(this).popover('hide');
    });
  }

  function getPreview(el) {
    const html = `
      <html>
        <body>
          ${getElement$(el).html()}
        </body>
      </html>
    `;
    const $iframe = $('<iframe>');
    $iframe.attr('srcdoc', html);
    $('body').prepend($iframe);
    return $iframe.html();
  }

  function getElement$(el) {
    const name = $(el).data('name');
    const content = {name: name, id: -1};
    return $(renderer.renderModule(content));
  }

  function getElement(el) {
    return getElement$(el);
  }
}
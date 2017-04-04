'use strict';

function ModuleView(modules, renderer) {
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

  return Object.assign(this, {
    getElement,
  });

  function getElement(el) {
    const name = $(el).data('name');
    const content = {name: name, id: -1};
    return $(renderer.renderModule(content))[0];
  }
}
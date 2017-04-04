'use strict';

function ModuleView(modules, renderer) {

  init();

  return Object.assign(this, {
    getElement,
  });

  function init() {
    const $list = $('<div class="list-group">');
    _.forOwn(modules, function(val, key) {
      const $item = $(`<div class="list-group-item" data-name="${key}">`);
      $item.append(`<div class="module-name">${key}</div>`);
      $item.append(getPreview(key));
      $list.append($item);
    });
    $('.module-view .module-list').html($list.html());
    $('.module-view .list-group-item').popover({
      trigger: 'hover',
      placement: 'right',
      html: true,
      title: function() {return $(this).data('name')},
      content: function() {return getPreview($(this).data('name'), true)},
    }).on('click dragstart', function() {
      $(this).popover('hide');
    });
  }

  function getPreview(name, large) {
    const style = large ? 'style="width: 800px; height: 600px"' : '';
    const html = `
      <html>
        <body style="text-align: center">
          ${renderer.renderModule({name})}
        </body>
      </html>
    `;
    const $iframe = $(`<iframe ${style}>`);
    $iframe.attr('srcdoc', html);
    return $iframe;
  }

  function getElement(el) {
    const name = $(el).data('name');
    const content = {name: name, id: -1};
    return $(renderer.renderModule(content))[0];
  }
}
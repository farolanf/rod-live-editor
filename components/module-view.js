'use strict';

function ModuleView(modules, renderer) {
  const $list = $('<div class="list-group">');
  _.forOwn(modules, function(val, key) {
    const content = {name: key};
    const body = renderer.render(content);
    const html = body.includes('</html>') ? body : `<html><body>${body}</body></html>`;
    const iframe = $('<iframe>');
    iframe.attr('srcdoc', html);
    const $item = $('<div class="list-group-item">');
    $item.append(`<div>${key}</div>`);
    $item.append(iframe);
    $list.append($item);
  });
  $('.module-view .module-list').html($list.html());
}
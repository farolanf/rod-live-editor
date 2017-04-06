
function InstanceMap(content, propertyView) {
  const btn = $('.property-view .instance-map-btn');
  btn.popover({
    container: 'body',
    trigger: 'manual',
    placement: 'left',
    html: true,
    title: 'Select instance to edit',
    content: function() {return getContent(content)},
  })
  .on('click', function(e) {
    e.stopPropagation();
    $(this).popover('toggle');
  })
  .on('inserted.bs.popover', function(e) {
    $('.popover').on('click', function(e) {
      e.stopPropagation();
    });
    $('.popover').css({
      height: '100%',
      overflow: 'hidden'
    }).find('.popover-content').css({
      height: '100%',
      overflow: 'auto'
    });
    $('.instance-map .instance-map__instance').on('click', function(e) {
      e.stopPropagation();
      const id = $(this).data('id');
      propertyView.setInstance(id);
    });
  });

  $(window).on('click', function() {
    btn.popover('hide');
  });

  function getContent(content) {
    const html = `
      <div class="instance-map">
        ${render(content)}
      </div>
    `;
    return html;
  }

  function render(content) {
    if (Array.isArray(content)) {
      return content.reduce(function(output, instance) {
        return output + renderInstance(instance);
      }, '');
    }
    return renderInstance(content);
  }

  function renderInstance(instance) {
    const html = `
      <div class="instance-map__instance" data-id="${instance.id}">
        <span>${instance.name}</span>
        ${renderContainers(instance)}
      </div>
    `;
    return html;
  }

  function renderContainers(instance) {
    const inst = new Instance(instance);
    const containers = inst.getContainers();
    let html = '';
    _.forOwn(containers, function(val, name) {
      html += `<div class="instance-map__container__name">${name}</div>`;
      if (!val.isDefault) {
        html += render(val.value);
      }
    });
    return html;
  }
}
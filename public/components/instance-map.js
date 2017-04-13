
/**
 * Create instance map to ease instance selection.
 * 
 * @param {object} content - The content store.
 * @param {object} propertyView - The property view.
 * @param {object} preview - The preview object.
 */
function InstanceMap(content, propertyView, preview) {

  // if true keep instance map opened after a selection
  let locked = false;

  const btn = $('.property-view .instance-map-btn');
  btn.popover({
    container: 'body',
    trigger: 'manual',
    placement: 'left',
    html: true,
    title: 'Select instance to edit',
    content: function() {return getContent(content)},
    template: getTemplate(),
  })
  .on('click', function(e) {
    e.stopPropagation();
    $(this).popover('toggle');
  })
  // init popover when it has been inserted to the dom
  .on('inserted.bs.popover', function(e) {
    const id = $(this).attr('aria-describedby');
    const popover = $(`#${id}`);
    $('.lock-btn', popover).off().on('click', toggleLocked.bind(this, id));
    popover.off().on('click', function(e) {
      e.stopPropagation();
    }).css({
      height: '100%',
      overflow: 'hidden'
    }).find('.popover-content').css({
      height: 'calc(100% - 30px)',
      overflow: 'auto'
    });
    // handles instance click
    $('.instance-map .instance-map__instance', popover).off().on('click', function(e) {
      e.stopPropagation();
      const id = $(this).data('id');
      propertyView.setInstance(id);
      preview.selectInstanceById(id);
      preview.scrollToInstance(id);
      !locked && btn.popover('hide');
    });
  });

  $(window).on('click', function() {
    !locked && btn.popover('hide');
  });

  function toggleLocked(id, e) {
    e.stopPropagation();
    locked = !locked;
    $(`#${id} .lock-btn`).toggleClass('lock-btn--disabled', !locked);
  }

  /**
   * Get the popover template.
   */
  function getTemplate() {
    return `
      <div class="popover" role="tooltip">
        <div class="arrow"></div>
        <h3 class="popover-title">
        </h3>
        <i class="fa fa-lock lock-btn lock-btn--disabled"></i>
        <div class="popover-content"></div>
      </div>
    `; 
  }

  /**
   * Get the popover content.
   */
  function getContent(content) {
    const html = `
      <div class="instance-map">
        ${render(content.content())}
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
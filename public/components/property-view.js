'use strict';

function PropertyView(editor) {
  if (!(this instanceof PropertyView)) {
    return new PropertyView(editor);
  }

  let instanceId;

  return {
    setInstance,
  };

  function setInstance(id) {
    if (id !== instanceId) {
      instanceId = id;
      render();
    }
  }

  function render() {
    const instance = Instance(instanceId);
    const props = instance.getProperties();
    let html = `<div class="list-group-item module-name">${instance.name}</div>`;
    _.forOwn(props, function(prop, key) {
      const color = prop.value.replace('#', '');
      html += `
        <div class="list-group-item">
          <span class="name">${key}</span>
          <input class="form-control" value="${color}" data-name="${key}" data-type="${prop.type}">
        </div>`;
    });
    $('#editor .property-view .list-group').html(html);
    $('.property-view [data-type="color"]').colorpicker();
    $('.property-view input').on('change', function(e) {
      const value = $(this).data('type') === 'color' ? `#${this.value}` : this.value;
      instance.setProperty($(this).data('name'), value);
      app.renderInstance(instance);
    });
  }
}
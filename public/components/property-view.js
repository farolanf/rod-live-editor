'use strict';

function PropertyView(editor, content) {

  let instanceId;

  return {
    setInstance,
    editGlobals,
  };

  function setInstance(id) {
    if (id !== instanceId) {
      instanceId = id;
      render();
    }
  }

  function editGlobals() {
    const props = content.globalProperties();
    _render('Global Properties', props, function(prop, value) {
      props[prop].value = value;
      app.renderPreview();
    });    
  }

  function render() {
    const instance = Instance(instanceId);
    _render(instance.name, instance.getProperties(), function(prop, value) {
      instance.setProperty(prop, value);
      app.renderInstance(instance);
    });
  }

  function _render(name, props, onChange) {
    let html = `<div class="list-group-item module-name">${name}</div>`;
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
      const prop = $(this).data('name');
      let value = this.value;
      if ($(this).data('type') === 'color') {
        const hex = parseInt(this.value, 16);
        if (!isNaN(hex)) {
          value = `#${this.value}`;
        }
      } 
      onChange(prop, value);
    });
  }
}
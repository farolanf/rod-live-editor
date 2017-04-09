'use strict';

function PropertyView(editor, content) {

  let instanceId;

  return {
    setInstance,
    editGlobals,
    addGlobalProperty,
  };

  function setInstance(id) {
    instanceId = id;
    render();
  }

  function editGlobals() {
    const btn = `
      <div class="btn-group">
        <button type="button" class="btn btn-sm btn-default add-property-btn">
          <i class="fa fa-plus"></i>
        </button>
      </div>
    `;
    const props = content.globalProperties();
    _render(`Global Properties ${btn}`, props, function(prop, value) {
      props[prop].value = value;
      app.renderPreview();
    });
    $('.property-view .module-name .add-property-btn').on('click', addProperty);
    function addProperty() {
      const modal = $('#add-property-modal');
      $('#add-property-modal__name', modal).val('');
      $('#add-property-modal__type', modal).val('text');
      $('.btn-primary', modal).attr('onclick', "propertyView.addGlobalProperty()");
      modal.modal();
    }
  }

  function addGlobalProperty() {
    const modal = $('#add-property-modal');
    const name = $('#add-property-modal__name', modal).val();
    const type = $('#add-property-modal__type', modal).val();
    const props = content.globalProperties();
    if (!props.hasOwnProperty(name)) {
      props[name] = {type, value: ''};
      editGlobals();
    }
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
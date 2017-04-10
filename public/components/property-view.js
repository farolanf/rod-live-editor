'use strict';

function PropertyView(editor, content) {

  let instanceId;

  events.addListener('instance-deleted', instanceDeleted);

  const flask = new CodeFlask();
  flask.run('#text-editor-modal__text-editor', {language:'html'});

  return {
    setInstance,
    editGlobals,
    addGlobalProperty,
    deleteGlobalProperty,
  };

  function instanceDeleted(id) {
    if (instanceId === id) {
      instanceId = null;
      $('.property-view .list-group').html('');
    }
  }

  function setInstance(id) {
    if (instanceId !== id) {
      instanceId = id;
      render();
    }
  }

  function editGlobals() {
    // reset instanceId so the same instance can be selected later
    instanceId = null;
    const btn = `
      <div class="btn-group">
        <button type="button" class="btn btn-sm btn-default add-property-btn">
          <i class="fa fa-plus"></i>
        </button>
      </div>
    `;
    const props = content.globalProperties();
    _render(`Global Properties ${btn}`, props, function(prop, value) {
      setGlobalProperty(prop, value);
    }, true);
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
    content.addGlobalProperty(name, type);
    editGlobals();
  }

  function deleteGlobalProperty(name) {
    content.deleteGlobalProperty(name);
    editGlobals();
  }

  function render() {
    const instance = new Instance(instanceId);
    _render(instance.name, instance.getProperties(), function(prop, value) {
      setInstanceProperty(prop, value);
    });
  }

  function _render(name, props, onChange, canDelete) {
    let html = `<div class="list-group-item module-name">${name}</div>`;
    _.forOwn(props, function(prop, key) {
      const delHtml = canDelete ? `<i class="fa fa-trash del-prop-btn" data-property="${key}"></i>` : '';
      const color = prop.value.replace('#', '');
      const textCls = prop.type === 'text' ? 'text-editor-btn' : '';
      const textBtn = prop.type === 'text' ? '<i class="fa fa-pencil"></i>' : '';
      const dataGlobal = instanceId === null ? 'data-global="true"' : '';
      html += `
        <div class="list-group-item">
          <span class="name ${textCls}">${key} ${textBtn}</span>
          <input class="form-control" value="${color}" ${dataGlobal} data-name="${key}" data-type="${prop.type}">
          ${delHtml}
        </div>`;
    });
    $('#editor .property-view .list-group').html(html);
    $('.property-view [data-type="color"]').colorpicker();
    $('.property-view input').on('change', function(e) {
      const prop = $(this).data('name');
      let value = this.value;
      if ($(this).data('type') === 'color') {
        const hex = parseInt(value, 16);
        if (!isNaN(hex)) {
          value = `#${value}`;
        }
      } 
      onChange(prop, value);
    });
    $('.property-view .del-prop-btn').on('click', function() {
      const name = $(this).data('property');
      uiutils.showConfirmModal('Delete Global Property', `Delete global property '${name}'?`, 
        'Delete', `propertyView.deleteGlobalProperty('${name}')`, 'danger');
    });
    $('.property-view .text-editor-btn').on('click', onTextBtnClick);
  }

  function onTextBtnClick() {
    const input = $(this).next();
    const prop = input.data('name');
    const isGlobal = !!input.data('global');
    const value = isGlobal ? getGlobalProperty(prop) : getInstanceProperty(prop);
    flask.update(value);
    flask.onUpdate(function(value) {
      if (isGlobal) {
        setGlobalProperty(prop, value);
      }
      else {
        setInstanceProperty(prop, value);
      }
      input.val(value);
    });
    $('#text-editor-modal').modal();
  }

  function getGlobalProperty(prop) {
    return content.globalProperties()[prop].value;
  }

  function getInstanceProperty(prop) {
    const instance = new Instance(instanceId);
    return instance.getProperties()[prop].value;
  }

  function setGlobalProperty(prop, value) {
    content.setGlobalProperty(prop, value);
    app.renderPreview();
  }

  function setInstanceProperty(prop, value) {
    const instance = new Instance(instanceId);
    instance.setProperty(prop, value);
    app.renderInstance(instance);
  }
}
'use strict';

/**
 * Handles property view.
 * 
 * @param {object} editor - The editor object.
 * @param {object} content - The content store.
 */
function PropertyView(editor, content) {

  let instanceId;
  let editingGlobal;
  let noLoad;

  events.addListener('instance-deleted', instanceDeleted);
  events.addListener('preview-loaded', load);
  events.addListener('preview-element-selected', setInstance);
  events.addListener('add-global-property', addGlobalProperty);
  events.addListener('delete-global-property', deleteGlobalProperty);

  const acedit = ace.edit('text-editor-modal__text-editor');
  acedit.setFontSize(14);
  acedit.getSession().setMode('ace/mode/html');
  acedit.getSession().setUseWrapMode(true);

  return {
    setInstance,
    editGlobals,
    addGlobalProperty,
    deleteGlobalProperty,
  };

  /**
   * Load the last edited properties.
   * @private
   */
  function load() {
    if (noLoad) {
      noLoad = false;
      return;
    }
    if (editingGlobal) {
      editGlobals();
    }
    else if (instanceId !== null) {
      _setInstance(instanceId);
    }
  }

  /**
   * Clear the view when the current edited instance is deleted.
   * 
   * @param {string} id - The id of the deleted instance.
   * @private
   */
  function instanceDeleted(id) {
    if (instanceId === id) {
      _setInstance(null);
    }
  }

  /**
   * Set the instance to be edited.
   * 
   * @param {string} id - The id of instance to be edited.
   * @public
   */
  function setInstance(id) {
    if (instanceId !== id) {
      _setInstance(id);
    }
  }

  /**
   * Edit an instance.
   * 
   * @param {string} id - Id of instance to be edited.
   */
  function _setInstance(id) {
    editingGlobal = false;
    instanceId = id;
    if (isNaN(String(instanceId))) {
      $('.property-view .list-group').html('');
    }
    else {
      render();
    }
  }

  /**
   * Renders view for editing global properties.
   * 
   * @public
   */
  function editGlobals() {
    editingGlobal = true;
    // reset instanceId so the same instance can be selected later
    instanceId = null;
    // render add global property button
    const btn = `
      <div class="btn-group">
        <button type="button" class="btn btn-sm btn-default add-property-btn">
          <i class="fa fa-plus"></i>
        </button>
      </div>
    `;
    const props = content.globalProperties();
    _render(`Global Properties ${btn}`, props, setGlobalProperty, true);
    $('.property-view .module-name .add-property-btn').on('click', addProperty);
    function addProperty() {
      const modal = $('#add-property-modal');
      $('#add-property-modal__name', modal).val('');
      $('#add-property-modal__type', modal).val('text');
      $('.btn-primary', modal).attr('onclick', 'events.emit("add-global-property")');
      modal.modal();
    }
  }

  /**
   * Add a global property. Called by add property modal.
   * 
   * @private
   */
  function addGlobalProperty() {
    const modal = $('#add-property-modal');
    const name = $('#add-property-modal__name', modal).val();
    const type = $('#add-property-modal__type', modal).val();
    content.addGlobalProperty(name, type);
    editGlobals();
  }

  /**
   * Delete a global property. Called by confirmation modal.
   * 
   * @param {string} name - The global property name.
   * @private
   */
  function deleteGlobalProperty(name) {
    content.deleteGlobalProperty(name);
    editGlobals();
  }

  /**
   * Renders controls for editing the instance.
   * 
   * @private
   */
  function render() {
    const instance = new Instance(instanceId);
    _render(instance.name, instance.getProperties(), setInstanceProperty);
  }

  /**
   * The general rendering code.
   * 
   * @param {string} name - The display name of edited entity.
   * @param {object} props - The object whose properties are to be edited.
   * @param {function} onChange - On change handler.
   * @param {boolean} canDelete - Display delete button when true.
   * @private
   */
  function _render(name, props, onChange, canDelete) {
    let html = `<div class="list-group-item module-name">${name}</div>`;
    _.forOwn(props, function(prop, key) {
      if (prop.hasOwnProperty('alias') || !prop.type) {
        return;
      }
      const delHtml = canDelete ? `<i class="fa fa-trash del-prop-btn" data-property="${key}"></i>` : '';
      const value = prop.type === 'color' ? prop.value.replace('#', '') : prop.value;
      const textCls = prop.type === 'text' ? 'text-editor-btn' : '';
      const textBtn = prop.type === 'text' ? '<i class="fa fa-pencil"></i>' : '';
      const dataGlobal = instanceId === null ? 'data-global="true"' : '';
      const style = prop.value ? `style="box-shadow: inset 0 0 0 4px ${prop.value}"` : '';
      html += `
        <div class="list-group-item">
          <span class="name ${textCls}">${key} ${textBtn}</span>
          <input class="form-control" value="${value}" ${dataGlobal} data-name="${key}" data-type="${prop.type}" ${style}>
          ${delHtml}
        </div>`;
    });
    $('#editor .property-view .list-group').html(html);
    $('.property-view [data-type="color"]').colorpicker();
    $('.property-view input').on('change', function(e) {
      const prop = $(this).data('name');
      let value = this.value;
      // add # in front of a hex number
      if ($(this).data('type') === 'color') {
        const hex = parseInt(value, 16);
        if (!isNaN(hex)) {
          value = `#${value}`;
        }
        $(this).attr('style', `box-shadow: inset 0 0 0 4px ${value}`);
      } 
      onChange(prop, value);
    });
    $('.property-view .del-prop-btn').on('click', function() {
      const name = $(this).data('property');
      uiutils.showConfirmModal('Delete Global Property', `Delete global property '${name}'?`, 
        'Delete', `events.emit('delete-global-property', '${name}')`, 'danger');
    });
    $('.property-view .text-editor-btn').on('click', onTextBtnClick);
  }

  /**
   * Show text editor.
   * 
   * @private
   */
  function onTextBtnClick() {
    const input = $(this).next();
    const prop = input.data('name');
    const isGlobal = !!input.data('global');
    const value = isGlobal ? getGlobalProperty(prop) : getInstanceProperty(prop);
    acedit.setValue(value);
    $('#text-editor-modal').modal().off('hide.bs.modal').on('hide.bs.modal', function() {
      const newValue = acedit.getValue();
      if (isGlobal) {
        setGlobalProperty(prop, newValue);
      }
      else {
        setInstanceProperty(prop, newValue);
      }
      input.val(newValue);
    });;
  }

  /**
   * Get global property value.
   * 
   * @param {string} prop - The global property name.
   * @return {string} - The global property value.
   * @private
   */
  function getGlobalProperty(prop) {
    return content.globalProperties()[prop].value;
  }

  /**
   * Get instance property value.
   * 
   * @param {string} prop - The property name.
   * @return {string} - The property value.
   * @private
   */
  function getInstanceProperty(prop) {
    const instance = new Instance(instanceId);
    return instance.getProperties()[prop].value;
  }

  /**
   * Set global property to a new value.
   * 
   * @param {string} prop - The global property name.
   * @param {string} value - The new global property value.
   * @private
   */
  function setGlobalProperty(prop, value) {
    noLoad = true;
    app.precompileOff(function() {
      undo.push();
      content.setGlobalProperty(prop, value);
      events.emit('global-property-changed');
    });
  }

  /**
   * Set instance property to a new value.
   * 
   * @param {string} prop - The property name.
   * @param {string} value - The new property value.
   * @private
   */
  function setInstanceProperty(prop, value) {
    noLoad = true;
    app.precompileOff(function(reloaded) {
      undo.push();
      const instance = new Instance(instanceId);
      instance.setProperty(prop, value);
      events.emit('instance-changed', instance);
      reloaded && updatePropertyUi(prop, value);
    });
  }

  /**
   * Update the property ui control to new value.
   * 
   * This separation is needed to handle newly rendered property view elements.
   * 
   * @param {string} prop - Property name.
   * @param {string} value - Property value.
   */
  function updatePropertyUi(prop, value) {
    value = value.replace(/^#/, '');
    $(`.property-view input[data-name="${prop}"]`).val(value);
  }
}
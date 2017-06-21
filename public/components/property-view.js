'use strict';

/**
 * Handles property view.
 * 
 * @param {object} editor - The editor object.
 * @param {object} content - The content store.
 */
function PropertyView(editor, content) {

  let instanceId;
  let moduleName;
  let editingGlobal;
  let noLoad;

  let setProperty, getProperty;

  events.addListener('instance-deleted', instanceDeleted);
  
  events.addListener('preview-loaded', load);
  events.addListener('language-changed', load.bind(null, true));
  events.addListener('warnings-changed', load.bind(null, true));

  events.addListener('preview-element-selected', setInstance);
  events.addListener('log-item-clicked', _setInstance);
  
  events.addListener('add-global-property', addGlobalProperty);
  events.addListener('delete-global-property', deleteGlobalProperty);
  events.addListener('property-changed', onPropertyChanged);
  events.addListener('module-property-changed', onPropertyChanged);
  
  events.addListener('show-property-list', showPropertyList);
  
  events.addListener('module-selected', editModule);

  const textEditor = new TextEditor('text-editor-modal', 'text-editor-modal__text-editor', 'ace/mode/html');

  $('.property-view .property-list').hide();

  $('.property-view .properties-btn').on('click', showPropertyList);

  return {
    clear,
    setInstance,
    editGlobals,
    addGlobalProperty,
    deleteGlobalProperty,
  };

  /**
   * Clear rendered properties.
   */
  function clear() {
    editingGlobal = false;
    instanceId = null;
    moduleName = null;
    $('.property-list').html('');
  }

  /**
   * Show the property list.
   */
  function showPropertyList() {
    $('.property-view .property-list').show();
    $('.property-view .errors-log').hide();
  }

  /**
   * Load the last edited properties.
   * 
   * @param {boolean} force - Force reloading.
   * @private
   */
  function load(force) {
    if (noLoad) {
      noLoad = false;
      if (!force) {
        return;
      }
    }
    if (editingGlobal) {
      editGlobals();
    }
    else if (instanceId) {
      _setInstance(instanceId);
    }
    else if (moduleName) {
      editModule(moduleName);
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
    showPropertyList();
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
    else {
      showPropertyList();
    }
  }

  /**
   * Edit an instance.
   * 
   * @param {string} id - Id of instance to be edited.
   */
  function _setInstance(id) {
    instanceId = id;
    moduleName = null;
    editingGlobal = false;
    getProperty = getInstanceProperty;
    setProperty = setInstanceProperty;
    showPropertyList();
    if (isNaN(String(instanceId))) {
      $('.property-view .property-list').html('');
    }
    else {
      const instance = new Instance(instanceId);
      _render(instance.name, instance.getProperties(), setInstanceProperty);
    }
  }

  /**
   * Get the edited module.
   * 
   * @return {object} - The module object. 
   */
  function getModule() {
    return store.modules.modules()[moduleName];
  }

  /**
   * Edit a module.
   * 
   * @param {string} name - Name of the module.
   */
  function editModule(name) {
    moduleName = name;
    instanceId = null;
    editingGlobal = false;
    getProperty = getModuleProperty;
    setProperty = setModuleProperty;
    const props = _.mapValues(getModule().properties, function(value, key) {
      return {type: value.type, value: value.default};
    });
    _render('Module Properties', props, setModuleProperty, false);
    showPropertyList();
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
    moduleName = null;
    getProperty = getGlobalProperty;
    setProperty = setGlobalProperty;
    showPropertyList();
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
   * The general rendering code.
   * 
   * @param {string} name - The display name of edited entity.
   * @param {object} props - The object whose properties are to be edited.
   * @param {function} onChange - On change handler.
   * @param {boolean} canDelete - Display delete button when true.
   * @private
   */
  function _render(name, props, onChange, canDelete) {
    const idHtml = instanceId ? `<span class="pull-right property-view__instance-id">id: ${instanceId}</span>` : '';
    let html = `<div class="list-group-item module-name">${name} ${idHtml}</div>`;
    _.forOwn(props, function(prop, key) {
      if (prop.hasOwnProperty('alias') || !prop.type) {
        return;
      }

      let value = prop.value;

      // i18n
      const useLanguage = app.useLanguage();
      const language = app.getLanguage();

      const lang = useLanguage && typeof value === 'object' ? ` (${language})` : '';

      const flag = typeof value === 'object' ? 'fa-flag' : 'fa-flag-o';
      const langBtnHtml = useLanguage ? `<i class="fa ${flag} i18n-btn" data-name="${key}"></i>` : '';

      if (typeof value === 'object') {
        value = value[language] || '';
      }
      if (prop.type === 'color') {
        value = value.replace('#', '');
      } 

      const delBtnHtml = canDelete ? `<i class="fa fa-trash del-prop-btn" data-property="${key}"></i>` : '';

      const textCls = prop.type === 'text' ? 'text-editor-btn' : '';
      const textBtn = prop.type === 'text' ? '<i class="fa fa-pencil"></i>' : '';
      
      const style = prop.type === 'color' ? `style="box-shadow: inset 0 0 0 4px #${value}"` : '';

      const hasWarning = instanceId ? log.propHasi18nWarning(instanceId, key) :
        moduleName ? log.modulePropHasi18nWarning(moduleName, key) :
        log.globalHasi18nWarning(key);
      const warningCls = hasWarning ? 'property-view__item--has-warning' : '';

      const tooltip = warningCls ? 'data-toggle="tooltip" title="This property is missing translation for selected language"' : '';
      
      html += `
        <div class="list-group-item ${warningCls}" ${tooltip}>
          <span class="name ${textCls}">${key}<span class="language-info">${lang}</span> ${textBtn}</span>
          <div class="property-controls">
            <input class="form-control" value="${value}" data-name="${key}" data-type="${prop.type}" ${style}>
            <div class="prop-buttons">
              ${langBtnHtml}
              ${delBtnHtml}
            </div>
          </div>
        </div>`;
    });
    $('#editor .property-view .property-list').html(html);
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
    $('.property-view .i18n-btn').on('click', oni18nClick);
    $('.property-view [data-toggle="tooltip"]').tooltip();
  }

  /**
   * Handles property changed.
   * 
   * Determines if property has warning.
   * 
   * @param {string} name - The name of property.
   * @param {string} text - The input text.
   * @param {(string|object)} value - Current value.
   */
  function onPropertyChanged(name, text, value) {
    const hasWarning = !text && typeof value === 'object';
    $(`.property-view [data-name="${name}"]`).closest('.list-group-item')
      .toggleClass('property-view__item--has-warning', hasWarning);
  }

  /**
   * Toggle i18n for the property.
   */
  function oni18nClick() {
    const btn = $(this);
    const usei18n = btn.is('.fa-flag');
    const prop = btn.data('name');
    const value = getProperty(prop);
    const language = app.getLanguage();
    if (usei18n) {
      // discard i18n 
      const eventName = 'discard-i18n-property';
      events.removeListener(eventName);
      events.once(eventName, function() {
        const newValue = value[language] || '';
        setProperty(prop, newValue, false);
        load(true);
      });
      const html = `<p>Discard i18n for this property and use current value for all    languages?</p><table class="discard-list"><tbody>` + _.map(value, function(val, key) {
        val = val.substr(0, 255);
        const currentCls = key === language ? 'discard-list__current' : '';
        return `<tr class="${currentCls}"><td>${key}</td><td>${val}</td></tr>`;
      }).join('') + '</tbody></table>';
      uiutils.showConfirmModal('Discard i18n', html, 'Discard', `events.emit("${eventName}")`, 'danger');
    }
    else {
      // use i18n
      const newValue = {[language]: value};
      setProperty(prop, newValue, false);
      load(true);
    }
  }

  /**
   * Show text editor.
   * 
   * @private
   */
  function onTextBtnClick() {
    const input = $(this).parent().find('input');
    const prop = input.data('name');
    let value = getProperty(prop);
    textEditor.setOnChangeHandler(function(value) {
      setProperty(prop, value);
      input.val(value);
    });
    textEditor.setValue(value);
    textEditor.show();
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
   * Get module property value.
   * 
   * @param {string} prop - The property name.
   * 
   * @return {string} - The property value.
   */
  function getModuleProperty(prop) {
    return getModule().properties[prop].default;
  }

  /**
   * Get i18n object with updated value.
   * 
   * @param {string} prop - Property name.
   * @param {string} newValue - New property value.
   * @param {(string|object)} curValue - Current property value.
   * @return {(string|object)} - The i18n object or the original new value.
   */
  function geti18nValue(prop, newValue, curValue) {
    if (app.useLanguage()) {
      if (typeof curValue === 'object') {
        const language = app.getLanguage();
        if (newValue === '') {
          newValue = curValue;
          delete newValue[language];
        }
        else {
          newValue = Object.assign({}, curValue, { 
            [language]: newValue,
          });
        }
      }
    }
    return newValue;
  }

  /**
   * Set global property to a new value.
   * 
   * @param {string} prop - The global property name.
   * @param {string} value - The new global property value.
   * @private
   */
  function setGlobalProperty(prop, value, usei18n) {
    usei18n = usei18n || typeof usei18n === 'undefined';
    noLoad = true;
    app.precompileOff(function() {
      undo.push();
      const textValue = value;
      if (usei18n) {
        value = geti18nValue(prop, value, getGlobalProperty(prop));
      }
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
  function setInstanceProperty(prop, value, usei18n) {
    usei18n = usei18n || typeof usei18n === 'undefined';
    noLoad = true;
    app.precompileOff(function(reloaded) {
      undo.push();
      const textValue = value;
      if (usei18n) {
        value = geti18nValue(prop, value, getInstanceProperty(prop));
      }
      const instance = new Instance(instanceId);
      instance.setProperty(prop, value);
      events.emit('instance-changed', instance);
      events.emit('property-changed', prop, textValue, value, instanceId);
      reloaded && updatePropertyUi(prop, textValue);
    });
  }

  /**
   * Set the module property value.
   * 
   * @param {string} prop - The property name.
   * @param {string} value - The property value.
   * @param {boolean} usei18n - Add to i18n object if true.
   */
  function setModuleProperty(prop, value, usei18n) {
    usei18n = usei18n || typeof usei18n === 'undefined';
    undo.push();
    const textValue = value;
    if (usei18n) {
      value = geti18nValue(prop, value, getModuleProperty(prop));
    }
    getModule().properties[prop].default = value;
    events.emit('module-property-changed', prop, textValue, value);
    events.emit('module-changed', moduleName);
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
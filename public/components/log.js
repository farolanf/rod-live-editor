
/**
 * Log errors and warnings.
 */
function Log() {

  let enableLog;
  let warnings = [];
  let errors = [];

  events.addListener('content-changed', reset);
  events.addListener('property-changed', reset);
  events.addListener('global-property-changed', reset);
  events.addListener('language-changed', reset);

  return Object.assign(this, {
    error,
    warn,
    hasError,
    hasi18nWarning,
    moduleHasi18nWarning,
    propHasi18nWarning,
    globalHasi18nWarning,
    geti18nWarnings,
    getLanguageWarnings,
    errors() {return errors},
    warnings() {return warnings},
  });

  function hasError() {
    return errors.length > 0;
  }

  /**
   * Check if instance has warning.
   * 
   * @param {string} id - Instance id.
   * @return {boolean} - True if has warning.
   */
  function hasi18nWarning(id) {
    return warnings.findIndex(function(value) {
      return !value.module && value.instanceId && value.instanceId == id;
    }) !== -1;
  }

  /**
   * Check if module has warning.
   * 
   * @param {string} name - Module name.
   * @param {string} moduleGroup - Module group name.
   * @return {boolean} - True if has warning.
   */
  function moduleHasi18nWarning(name, moduleGroup) {
    return warnings.findIndex(function(value) {
      return value.module && value.module === name && value.moduleGroup === moduleGroup;
    }) !== -1;
  }

  /**
   * Check if property for a given instance has warning.
   * 
   * @param {string} id - Instance id.
   * @param {string} property - Property name.
   * @return {boolean} - True if has warning.
   */
  function propHasi18nWarning(id, property) {
    return geti18nWarnings(id).findIndex(function(value) {
      return value.property === property;
    }) !== -1;    
  }

  /**
   * Check if global property has warning.
   * 
   * @param {string} property - The property name.
   * @return {boolean} - True if has warning.
   */
  function globalHasi18nWarning(property) {
    return warnings.findIndex(function(value) {
      return !value.hasOwnProperty('instanceId') && !value.hasOwnProperty('module') && value.property === property;
    }) !== -1;
  }

  /**
   * Get all warnings for an instance.
   * 
   * @param {string} id - Instance id.
   * @return {array} - Array of warnings for the instance.
   */
  function geti18nWarnings(id) {
    return warnings.filter(function(value) {
      return !value.module && value.instanceId && value.instanceId == id;
    });
  }

  /**
   * Get all warnings for a language.
   * 
   * @param {string} language - Language code.
   * @return {array} - Array of warnings for the language.
   */
  function getLanguageWarnings(language) {
    reset(language);
    return warnings.filter(function(value) {
      return value.language === language;
    });
  }

  /**
   * Add warning.
   * 
   * @param {object} data - Warning info.
   */
  function warn(data) {
    enableLog && warnings.push(data);
  }

  /**
   * Add error.
   * 
   * @param {object} data - error info.
   */
  function error(data) {
    enableLog && errors.push(data);
  }

  /**
   * Repopulate logs.
   */
  function reset(language) {
    if (store.modules.isEmpty() || store.content.isEmpty()) {
      return;
    }
    warnings = [];
    errors = [];
    enableLog = true;
    store.createRenderer(language || app.getLanguage()).render(store.content.content());
    enableLog = false;
    events.emit('warnings-changed');
    events.emit('errors-changed');
  }
}
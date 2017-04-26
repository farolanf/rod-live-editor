
/**
 * Log errors and warnings.
 */
function Log() {

  let enableLog;
  let warnings = [];

  events.addListener('i18n-warning', oni18nWarning);
  events.addListener('content-changed', reset);
  events.addListener('property-changed', reset);
  events.addListener('global-property-changed', reset);
  events.addListener('language-changed', reset);

  return Object.assign(this, {
    hasi18nWarning,
    propHasi18nWarning,
    globalHasi18nWarning,
    geti18nWarnings,
  });

  /**
   * Check if instance has warning.
   * 
   * @param {string} id - Instance id.
   * @return {boolean} - True if has warning.
   */
  function hasi18nWarning(id) {
    return warnings.findIndex(function(value) {
      return value.instanceId && value.instanceId == id;
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
      return value.instanceId && value.instanceId == id;
    });
  }

  /**
   * Add warning.
   * 
   * @param {object} data - Warning info.
   */
  function oni18nWarning(data) {
    enableLog && warnings.push(data);
  }

  /**
   * Repopulate logs.
   */
  function reset() {
    warnings = [];
    enableLog = true;
    store.createRenderer(app.getLanguage()).render(store.content.content());
    enableLog = false;
    events.emit('warnings-changed');
  }
}
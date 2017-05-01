
/**
 * Various utilities for the content.
 */
const contentUtils = {

  /**
   * Get specified instance from the given content.
   * 
   * @param {string} instanceId - The instance id.
   * @param {object} content - The content.
   * @return {object} - The found instance.
   */
  getInstance(instanceId, content) {
    if (Array.isArray(content)) {
      for (const i in content) {
        const result = contentUtils.getInstance(instanceId, content[i]);
        if (result) {
          return result;
        }
      }
    }
    else if (content.id === instanceId) {
      return content;
    }
    else {
      for (const key in content) {
        const val = content[key];
        if (Array.isArray(val)) {
          const result = contentUtils.getInstance(instanceId, val);
          if (result) {
            return result;
          }        
        }
      }
    }
  },

  /**
   * Generate javascript from a json.
   * 
   * @param {string} json - The json.
   * @return {string} - The javascript version of the json.
   */
  toJs(json) {
    return json.replace(/"([\w]+)":/g, '$1:')
      .replace(/"(function [^]+?})"(,?\n)/g, functionStr)
      .replace(/: "([^]*?)"(,?\n)/g, valueStr);
    
    /**
     * Unescape new lines and quotes.
     */
    function functionStr(m0, m1, m2) {
      m1 = unescape(m1);
      return m1 + m2;
    }

    /**
     * Use single quotes and escape the nested ones.
     */
    function valueStr(m0, m1, m2) {
      m1 = unescape(m1);
      return `: \`${m1}\`${m2}`;
    }

    /**
     * Unescape a string.
     * 
     * @param {string} str - The string
     * @return {string} - The unescaped string.
     */
    function unescape(str) {
      return str.replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'");
    }
  },

  /**
   * Get json of the content.
   * 
   * The content will be converted to json without helper
   * properties included like parent and container.
   * 
   * @param {object} content - The content.
   * @return {string} - The json of the content.
   */
  getJSON(content) {
    return JSON.stringify(content, contentUtils.filterContent, 2);		
  },

  /**
   *  Filter parent property to avoid circular reference.
   * 
   *  Used by JSON.stringify()
   */
  filterContent(key, value) {
    if (key === 'parent' || key === 'container' || key === 'getPropertyValue') {
      return;
    }
    if (typeof value === 'function') {
      return `${value.toString()}`;
    }
    return value;
  },
};

// export on test environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = contentUtils;
}

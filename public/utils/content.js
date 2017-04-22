
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
      .replace(/: "([^"]*)"(,?\n)/g, valueStr);
    
    function functionStr(m0, m1, m2) {
      m1 = m1.replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'");
      return m1 + m2;
    }
    function valueStr(m0, m1, m2) {
      m1 = m1.replace(/'/g, "\\'");
      return `: '${m1}'${m2}`;
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

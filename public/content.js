'use strict';

// load dependencies on test environment
if (typeof require !== 'undefined') {
	var EventEmitter = require('../public/libs/js/EventEmitter.min.js');
}

/**
 * Manages the content and use content REST API.
 */
function Content() {

	let content = {
		globalProperties: {},
		data: [],
	};

	return Object.assign(this, {
		/**
		 * Get the global properties.
		 * 
		 * @return {object} - The global properties object.
		 */
		globalProperties() {return content.globalProperties},

		/**
		 * Get the content data.
		 * 
		 * @return {array} - The array of root instances.
		 */
		content() {return content.data},

		getJSON,
		fromJSON,		
		setContent,
		loadContent,
		addGlobalProperty,
		deleteGlobalProperty,
		setGlobalProperty,
		isEmpty,
	});

	function getJSON() {
		return toJs(JSON.stringify(content, filterContent, 2));		
	}

	function fromJSON(json) {
		// update the content with new data
		eval(`content = ${json}`);
		// tell subscribers about this change
		emit();
	}

	function toJs(json) {
		return json.replace(/"([^"]+)":/g, '$1:')
			.replace(/"<(function [^>]+)>"(,?\n)/g, functionStr)
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
	}

  /**
   *  Filter parent property to avoid circular reference.
   * 
   *  Used by JSON.stringify()
   */
  function filterContent(key, value) {
    if (key === 'parent') {
      return;
    }
		if (typeof value === 'function') {
			return `<${value.toString()}>`;
		}
    return value;
  }

	/**
	 * Set the content data.
	 * 
	 * @param {array} c - The new data (tree of instances).
	 */
	function setContent(c) {
		content.data = c;
		// tell subscribers about this change
		emit();
	}

	/**
	 * Load content from the backend.
	 * 
	 * @param {string} id - The id of the content to be loaded.
	 * @param {string} precompileParameters - Precompile parameters or false.
	 */
	function loadContent(id, precompileParameters) {
		const data = {};
		precompileParameters && (data.precompileParameters = precompileParameters);
		$.getJSON(uri.path()+`api/content/${id}`, data, function(data) {
			fromJSON(data);
		});
	}

	/**
	 * Emit content-changed event.
	 * 
	 * @private
	 */
	function emit() {
		events.emit('content-changed', content.data, content.globalProperties);
	}

	/**
	 * Add a new property to the global property object.
	 * 
	 * @param {string} name - The new property name.
	 * @param {string} type - The new property type.
	 */
	function addGlobalProperty(name, type) {
    if (!content.globalProperties.hasOwnProperty(name)) {
      content.globalProperties[name] = {type, value: ''};
		}
	}

	/**
	 * Delete a global property.
	 * 
	 * @param {string} name - The property name.
	 */
	function deleteGlobalProperty(name) {
		delete content.globalProperties[name];
	}

	/**
	 * Assign new value to a global property.
	 * 
	 * @param {string} prop - The property name.
	 * @param {string} value - The new value.
	 */
	function setGlobalProperty(prop, value) {
		content.globalProperties[prop].value = value;
	}

	/**
	 * Check if the content is empty.
	 * 
	 * @return {boolean} - True if empty.
	 */
	function isEmpty() {
		return content.data.length <= 0;
	}
}

// export the Content on test environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Content;
}

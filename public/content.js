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
		
		/**
		 * Get the content which has data and global properties.
		 */
		all() {return content},

		usePrecompileParameters: true,
		
		setContent,
		loadContent,
		addGlobalProperty,
		deleteGlobalProperty,
		setGlobalProperty,
		isEmpty,
	});

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
	 */
	function loadContent(id, precompileParameters) {
		const data = {};
		this.usePrecompileParameters && (data.precompileParameters = precompileParameters);
		$.getJSON(uri.path()+`api/content/${id}`, data, function(data) {
			// update the content with new data
			eval(`content = ${data}`);
			// tell subscribers about this change
			emit();
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

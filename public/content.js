'use strict';

function Content() {

	const ee = new EventEmitter();

	let content = {
		globalProperties: {},
		data: [],
	};

	return Object.assign(this, {
		globalProperties() {return content.globalProperties},
		content() {return content.data},
		all() {return content},
		setContent,
		loadContent,
		addGlobalProperty,
		deleteGlobalProperty,
		setGlobalProperty,
		subscribe,
		isEmpty,
	});

	function setContent(c) {
		content.data = c;
		emit();
	}

	function loadContent(id) {
		$.getJSON(uri.path()+`api/content/${id}`, function(data) {
			eval(`content = ${data}`);
			emit();
		});
	}

	function emit() {
		ee.emit('content', content.data, content.globalProperties);
	}

	function addGlobalProperty(name, type) {
    if (!content.globalProperties.hasOwnProperty(name)) {
      content.globalProperties[name] = {type, value: ''};
		}
	}

	function deleteGlobalProperty(name) {
		delete content.globalProperties[name];
	}

	function setGlobalProperty(prop, value) {
		content.globalProperties[prop].value = value;
	}

	function subscribe(fn) {
		ee.addListener('content', fn);
	}

	function isEmpty() {
		return content.data.length <= 0;
	}
}
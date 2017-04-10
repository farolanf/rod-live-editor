'use strict';

function Content() {

	const ee = new EventEmitter();

	let globalProperties = {
		"color1": {type: 'color', value: "#eeeeee"},
		"color2": {type: 'color', value: "green"},
		"backgroundColorBody": {type: 'color', value: "white"},
		"backgroundColorFooter": {type: 'color', value: "blue"},
		"backgroundColor": {type: 'color', value: "#fff"},
		"hiddenPreheader": {type: 'text', value: "test"},
	};
	
	let content = [];

	return Object.assign(this, {
		globalProperties() { return globalProperties },
		content() { return content },
		setContent,
		loadContent,
		addGlobalProperty,
		deleteGlobalProperty,
		setGlobalProperty,
		subscribe,
		isEmpty,
	});

	function setContent(c) {
		content = c;
		emit();
	}

	function loadContent(id) {
		$.getJSON(uri.path()+`api/content/${id}`, function(data) {
			eval(`content = ${JSON.parse(data.content)}`);
			emit();
		});
	}

	function emit() {
		ee.emit('content', content, globalProperties);
	}

	function addGlobalProperty(name, type) {
    if (!globalProperties.hasOwnProperty(name)) {
      globalProperties[name] = {type, value: ''};
		}
	}

	function deleteGlobalProperty(name) {
		delete globalProperties[name];
	}

	function setGlobalProperty(prop, value) {
		globalProperties[prop].value = value;
	}

	function subscribe(fn) {
		ee.addListener('content', fn);
	}

	function isEmpty() {
		return content.length <= 0;
	}
}
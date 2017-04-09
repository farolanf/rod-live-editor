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
		loadContent,
		subscribe,
	});

	function loadContent(id) {
		$.getJSON(`/api/content/${id}`, function(data) {
			eval(`content = ${JSON.parse(data.content)}`);
			ee.emit('content', content, globalProperties);
		});
	}

	function subscribe(fn) {
		ee.addListener('content', fn);
	}
}
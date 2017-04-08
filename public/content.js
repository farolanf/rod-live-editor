'use strict';

function Content() {

	const ee = new EventEmitter();

	let globalProperties = {
		"color1": "#eeeeee",
		"color2": "green",
		"backgroundColorBody": "white",
		"backgroundColorFooter": "blue",
		"backgroundColor": "#fff",
		"hiddenPreheader": "test",
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
const domino = require('domino');

class DomWrapper {
	constructor () {
		this._dom = null;
	}

	async setDom (string) {
		this._dom = domino.createWindow(`<!doctype html>
			<body>${string}</body>
		`, true);
	}

	getOneByName(name) {
		let elements = this._dom.getElementsByName(name);

		if (!elements.length) {
			return null;
		}

		return elements.shift();
	}

	getByName(name) {
		return this._dom.document.getElementsByName(name);
	}

	querySelector(tag) {
		return this._dom.document.querySelectorAll(tag);
	}

	eachByTag(tag, call) {
		if (typeof call !== 'function')
			throw new  Error('Call must be function');

		let elements = this.querySelector(tag);

		let len = 0;

		for (let element of Object.values(elements)) {

			if (element && element.nodeName === tag.toUpperCase()) {
				len++;
				call(element);
			}
		}

		return len;
	}
}

module.exports = DomWrapper;

const DOMParser = require('xmldom').DOMParser;

class XdomWrapper {
	constructor () {
		this._dom = null;
	}

	async setDom (string) {
		this._dom = new DOMParser().parseFromString(`<xml>${string}</xml>`);
	}

	getAllByTag(tag) {
		return this._dom.getElementsByTagName(tag);
	}

	eachByTag(tag, call) {
		if (typeof call !== 'function')
			throw new  Error('Call must be function');

		let elements = this.getAllByTag(tag);

		for (let element of Object.values(elements)) {
			if (element && element.tagName === tag) {
				call(element);
			}
		}

		return elements.length;
	}
}

module.exports = XdomWrapper;

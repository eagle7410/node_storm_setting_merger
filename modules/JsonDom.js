const parser = require('xml2json');

class JsonDom {
	constructor () {
		this.json = null;
	}

	async setXml (xml) {
		this.json = JSON.parse(parser.toJson(xml));
	}

	getXml (opts = {sanitize : true}) {
		return parser.toXml(this.json, opts);
	}
}

module.exports = JsonDom;

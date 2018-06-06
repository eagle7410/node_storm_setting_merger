// Libs
const fsp         = require('fsp-eagle');
const assert      = require('assert');
const XdomWrapper = require('../modules/XdomWrapper');
const JsonDom     = require('../modules/JsonDom');

// Init
const PATH_TO_TEST_FILE = `${__dirname}/data/JavaScript.xml`;
let json;

describe('Testing xml covert to js', function () {
	it('test XdomWrapper', async () => {
		const cont = await fsp.readFile(PATH_TO_TEST_FILE);
		const dom = new XdomWrapper();
		await dom.setDom(cont.toString());

		let i = 0;
		let length = dom.eachByTag('template', () => {
			++i;
		});

		assert.equal(i, 26);
		assert.equal(length, 26);

	});

	it('test xml2json to json', async () => {
		const dom = new JsonDom();
		const cont = await fsp.readFile(PATH_TO_TEST_FILE);

		await dom.setXml(cont.toString());

		assert.equal(dom.json.templateSet.template.length, 26);

	});
});

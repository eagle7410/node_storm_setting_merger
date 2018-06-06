// Libs
const path = require('path');
const fsp  = require('fsp-eagle');
const Log  = require('console-color');

// Init
const log = new Log();

void async function install() {
	log.info('[...] Run install');

	try {
		const ROOT = path.resolve();
		const PATH_SETTINGS = path.join(ROOT, 'settings');
		const PATH_RUNTIME  = path.join(ROOT, 'runtime');

		for (let subdir of ['merge', 'target', 'result'])
			await fsp.mustPath(path.join(PATH_SETTINGS, subdir));

		for (let subdir of ['merge', 'target', 'result'])
			await fsp.mustPath(path.join(PATH_SETTINGS, subdir));

		await fsp.mustPath(path.join(ROOT, 'logs'));
		await fsp.mustPath(PATH_RUNTIME);

		log.success('[OK] Install success');

	} catch (e) {
		log.error('[ERR] Install fail', e);
	} finally {
		process.exit();
	}
}();

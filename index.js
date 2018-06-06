// Libs
const path    = require('path');
const fsp     = require('fsp-eagle');
const Zipper  = require('jszipper');
const Log     = require('console-color');
const JsonDom = require('./modules/JsonDom');

// Init
const logConsole = new Log();
const domJson    = new JsonDom();
const logArray = [];
const PATH_SETTINGS = `${__dirname}/settings`;
const PATH_RUNTIME = `${__dirname}/runtime`;
const PATH_RUNTIME_TARGET_DIR = `${PATH_RUNTIME}/target`;
const PATH_RUNTIME_MERGE_DIR = `${PATH_RUNTIME}/merge`;
const PATH_ARCH_TARGET_DIR = `${PATH_SETTINGS}/target`;
const PATH_ARCH_MERGE_DIR = `${PATH_SETTINGS}/merge`;
const PATH_ARCH_RESULT_DIR = `${PATH_SETTINGS}/result`;
const log = {
	info : (mess, data) => {
		logConsole.info(mess, data);
		logArray.push({mess, data, type: 'info'});
	},
	error : (mess, data) => {
		logConsole.error(mess, data);
		logArray.push({mess, data, type: 'error'});
	},
	success : (mess, data) => {
		logConsole.success(mess, data);
		logArray.push({mess, data, type: 'success'});
	},
	warn : (mess, data) => {
		logConsole.warn(mess, data);
		logArray.push({mess, data, type: 'warn'});
	},
};

const unzipArchive = async (dirSourse, dirTarget, ext = 'jar') => {
	for( let file of await fsp.readdir(dirSourse)) {
		if (path.extname(file) === '.' + ext) {
			const zip = new Zipper();

			await zip.unpack(`${dirSourse}/${file}`, dirTarget);

			return path.basename(file, '.' + ext);
		}
	}

	return false;
};

const loadFileToJson = async (pathFile) => {

	const cont = await fsp.readFile(pathFile);

	await domJson.setXml(cont.toString());

	return domJson.json
};

const mergeTemplateFile = async (dirTarget, dirMerge, file) => {

	log.info(`[ ${file} ] Run merge .`);

	const pathTemplateXml = `${dirTarget}/${file}`;

	let targetTemplateJson = await loadFileToJson(pathTemplateXml);
	let mergeTemplateJson = await loadFileToJson(`${dirMerge}/${file}`);

	let targetTemplateObj = {};


	if (!Array.isArray(targetTemplateJson.templateSet.template)) {
		log.warn(` [ ${file} ] End merge . Only one template`);
		return;
	}

	targetTemplateJson.templateSet.template.map(tpl => {
		targetTemplateObj[tpl.name] = tpl;
	});

	mergeTemplateJson.templateSet.template.map(tpl => {
		if (!targetTemplateObj[tpl.name]) {
			log.info(` [ ${file} ] Add new tpl ${tpl.name}.`);
			targetTemplateJson.templateSet.template.push(tpl);
		} else if (targetTemplateObj[tpl.name].value !== tpl.value) {
			let setTpl = targetTemplateJson.templateSet.template.find(ttpl => ttpl.name === tpl.name);
			setTpl.value = tpl.value;
			log.info(` [ ${file} ] Update tpl ${tpl.name}. Set new ${tpl.value}`);
		} else {
			log.info(` [ ${file} ] ~~No update tpl ${tpl.name}.`);
		}
	});

	domJson.json = targetTemplateJson;

	await fsp.writeFile(pathTemplateXml, domJson.getXml());
	log.info(`[ ${file} ] End merge .`);
};
void async function merge() {
	try {
		log.info(`Run merge settings`);
		// Clear old
		await fsp.mvdir(PATH_RUNTIME_TARGET_DIR);
		await fsp.mvdir(PATH_RUNTIME_MERGE_DIR);

		// Unpack new
		await fsp.mustdir(PATH_RUNTIME_TARGET_DIR);

		let dirTarget = await unzipArchive(PATH_ARCH_TARGET_DIR, PATH_RUNTIME_TARGET_DIR);

		if (!dirTarget) {
			throw new Error(`Path not have jar file ${PATH_ARCH_TARGET_DIR}`);
		}

		await fsp.mustdir(PATH_RUNTIME_MERGE_DIR);

		let dirMerge = await unzipArchive(PATH_ARCH_MERGE_DIR, PATH_RUNTIME_MERGE_DIR);

		if (!dirMerge) {
			throw new Error(`Path not have jar file ${PATH_ARCH_MERGE_DIR}`);
		}

		let dirTargetBase = `${PATH_RUNTIME_TARGET_DIR}/${dirTarget}`;
		let dirTargetTpl = `${dirTargetBase}/templates`;
		let dirMergeTpl = `${PATH_RUNTIME_MERGE_DIR}/${dirMerge}/templates`;

		for (let file of await ['JavaScript.xml', 'user.xml', 'Vue.xml', 'html_xml.xml']) {
			if (path.extname(file) !== '.xml') {
				continue;
			}

			if (! await fsp.exists(`${dirTargetTpl}/${file}`)){
				log.info(`New file in tpl ${file}`);
				await fsp.copyFile(`${dirMergeTpl}/${file}`, `${dirTargetTpl}/${file}`);
				continue;
			}

			await mergeTemplateFile(dirTargetTpl, dirMergeTpl, file);
		}

		const zip = new Zipper();

		// Clear old
		await fsp.mvdir(PATH_ARCH_RESULT_DIR);
		await fsp.mustdir(PATH_ARCH_RESULT_DIR);
		await zip.pack(dirTargetBase, `${PATH_ARCH_RESULT_DIR}/${dirTarget}.jar`);

		log.success('Merge setting ok.');
	} catch (e) {
		log.error('Error in merge', e);
	} finally {

		if (logArray.length) {
			await fsp.writeFile(
				`${__dirname}/logs/log_${Date.now()}.log`,
				logArray.map(lg => {
					const data = lg.data ? '\n' + JSON.stringify(lg.data, null, '\t') : '';
					return `[ ${lg.type.toUpperCase()} ] ${lg.mess} ${data}`;
				}).join('\n')
			)
			;
		}

		process.exit();
	}
}();

var gutil = require('gulp-util'),
	appRoot = require('app-root-path'),
	Buffer = require('buffer').Buffer,
	PluginError = gutil.PluginError,
	map = require('event-stream').map,
	fs = require('fs'),

	defaults = {
		versionRegex: function (extensions) {
			var exts = extensions.join('|'),
				regexString = "(\\.(?:" + exts + ")\\?v=)(\\@version\\@)";
			return new RegExp(regexString, 'ig');
		},
		prefixUrlRegex: function () {
			var regexString = "(\\@prefix\\@)";
			return new RegExp(regexString, 'ig');
		}
	},
	/**
	 * @class ShortId
	 * @classdesc Short unique id generator
	 * @constructor
	 */
	ShortId = function () {
		var lastTime,
			_self = this;
		/**
		 * Get new pseudo-unique id
		 * @alias next
		 * @returns {string} Unique ID
		 */
		_self.next = function () {
			var d = new Date(),
				date = (d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 1)) * 1000;
			while (lastTime >= date) {
				date++;
			}
			lastTime = date;
			return date.toString(16);
		}
	},
	appendVersionPlugin = function (extensions, options) {
		console.log('welcome to use the version append plugins.');
		return map(function (file, cb) {

			// var fc = fs.readFile('/');
			// console.log('fc'+fc);
			var pJson, version,prefixUrl,shortId;
			if (!file) {
				throw new PluginError('gulp-rev-append', 'Missing file option for gulp-version-append.');
			}
			if (!file.contents) {
				throw new PluginError('gulp-rev-append', 'Missing file.contents required for modifying files using gulp-rev-append.');
			}

			if (options) {
				console.log(JSON.stringify(options));
				if (options.appendType === 'timestamp') {
					version = (new Date()).getTime();
					if(options.prefix == undefined){
						throw new PluginError('gulp-rev-append', 'versionOption.prefix in gulpfile.js is undefined.以后都在gulpfile文件中修改prefix');
					}
					prefixUrl = options.prefix;
				} else if (options.appendType === 'guid') {
					shortId = new ShortId();
					version = shortId.next();
				}
				else {
					if (options.versionFile) {
						pJson = require(options.versionFile)
					} else {
						pJson = require('package.json')
					}
					version = pJson && pJson.version;
					prefixUrl = pJson&&pJson.prefix;

				}
			} else {
				pJson = appRoot.require('package.json');
				version = pJson && pJson.version;
			}
			var contentStr = file.contents.toString();
			contentStr = contentStr.replace(defaults.versionRegex(extensions), '$1' + version);

			contentStr = contentStr.replace(defaults.prefixUrlRegex(),  prefixUrl);
			// console.log('prefix:'+prefixUrl);
			file.contents = new Buffer(contentStr);
			cb(null, file);
		});
	};

module.exports = appendVersionPlugin;

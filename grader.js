#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
	var instr = infile.toString();
	if(!fs.existsSync(instr)) {
		console.log("%s does not exist. Exiting.", instr);
		process.exit(1);
	}
	return instr;
};

var cheerioHtmlFile = function(htmlfile) {
	return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
	return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
	console.error('htmlfile: ' + htmlfile);
	$ = cheerioHtmlFile(htmlfile);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for (var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
};

var clone = function(fn) {
	return fn.bind({});
};

var httpresponse = function() {
	var resp = function(result, response) {
		fs.writeFileSync("get.html", result);
	};
	return resp;	
};

var fetchURL = function(httpurl, checksfile) {
	var urlstr = httpurl.toString();
	console.error('httpurl: ' + urlstr);
	var outstr = httpresponse(); 
	var res = rest.get(urlstr).on('complete', outstr);
	if (res) 
		return outstr;	
	else
		console.error("FAIL TO RESTLER");
};

if (require.main == module) {
	program
		.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
		.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
		//.option('-u, --url <url>', 'Path to url', clone(fetchURL))
		.option('-u, --url <url>', 'Path to url')
		.parse(process.argv);

	if (program.url) {
		var checkJson = fetchURL(program.url, program.checks);
		var checkJson = checkHtmlFile("get.html", program.checks);
	}
	else if (program.file) {
		var checkJson = checkHtmlFile(program.file, program.checks);
	}
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
} else {
//	exports.checkHtmlFile = checkHtmlFile;
}


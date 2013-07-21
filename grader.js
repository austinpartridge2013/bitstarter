#!/usr/bin/env node
/*
 Automatically grade files for the presence of specified HTML tags/attributes. Uses commander.js and cheerio.  Teaches command line application development and basic DDM parsing.

*/

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var sleep = require('sleep');
var HTMLFILE_DEFAULT = "temp.html";
var CHECKSFILE_DEFAULT = "checks.json";

var writeToFile = function(urlLocation) {
    rest.get(urlLocation).on('complete', function(data) {
        fs.writeFile(HTMLFILE_DEFAULT, data, null); });
}

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
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
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var callback = function(cont) { fs.writeFile('temp.html', cont, null); };

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <external_url>', 'URL Location of file')
        .parse(process.argv);
    if (program.url) {
        rest.get(program.url).on('complete', callback);
        sleep.sleep(5);
    }
    var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}

const Logger = require('./logger.js');

const FS = require('fs');

let locales = {};

async function init()
{
    Logger.info('LOADING LOCALES');
    locales = JSON.parse(FS.readFileSync('../data/locale.json'));
    Logger.info(`LOADING locale.json ...`);
}

function GetLocaleListJSON()
{
    return JSON.stringify(locales);
}

function GetLocaleList()
{
    return locales;
}

module.exports = {
    init: init,
    GetLocaleListJSON: GetLocaleListJSON,
    GetLocaleList: GetLocaleList
}

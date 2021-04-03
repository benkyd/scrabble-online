const Logger = require('./logger.js');

const FS = require('fs');

let locales = {};

async function init()
{
    locales = JSON.parse(FS.readFileSync('../data/locale.json'));
    Logger.info('LOCALES LOADED');
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

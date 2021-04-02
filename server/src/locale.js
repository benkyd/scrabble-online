const FS = require('fs');

let locales = {};

function init()
{
    locales = JSON.parse(FS.readFileSync('src/locale.json'));
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

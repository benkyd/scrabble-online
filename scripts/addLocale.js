// called with CLI args to add a locale code (with english translation & meaning) to the en.lang
// calls updateLocaleFromEnglish to update the other language files
// calls langParser to update the locale.json with the newly updated files

// call as node ./addLocale.js [locale-code] [english translation of the sentence]

const fs = require('fs');

const localeName = process.argv.slice(2)[0];
const localeString = process.argv.slice(3).join(' ');

fs.appendFileSync('../data/en.lang', '\n' + localeName + ':' + localeString);

require('./updateLocaleFromEnglish.js');
require('./langParser.js');

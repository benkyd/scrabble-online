// simple script to make a new, blank language file for filling in based on the english one

// call as node newLocale.js fr

const fs = require('fs');

const fileToMake = process.argv.slice(2)[0];

// load english
const englishLocaleCodes = fs.readFileSync('../data/en.lang').toString().split('----')[1].split('\n').filter(e => e != null && e != '').map(e => e.split(':')[0]);
const output = `language:${fileToMake}\n----\n` + englishLocaleCodes.reduce((p, e) => p += e + ':\n').toString();

fs.writeFileSync(`../data/${fileToMake}.lang`, output);


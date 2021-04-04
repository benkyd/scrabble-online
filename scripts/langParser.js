// parses the lang files and generates a locale.json file

const fs = require('fs');

let languages = [];
fs.readdirSync('../data/').map(e => {
    if (e.endsWith('.lang')) languages.push(e.split('.')[0]);
});

let localeCodes = [];
let translations = {};

// extract data from language files
for (let lang in languages)
{
    let codesToTranslations = fs.readFileSync(`../data/${languages[lang]}.lang`).toString()
                                                                                .split('----')[1]
                                                                                .split('\n')
                                                                                .filter(e => e != null && e != '')
                                                                                .map(e => new Array(e.split(':')[0], e.split(':')[1]));
    translations[languages[lang]] = codesToTranslations;
    
    // build list of localeCodes
    for (const code in codesToTranslations)
    {
        if (!localeCodes.includes(codesToTranslations[code][0])) localeCodes.push(codesToTranslations[code][0]);
    }
}

let output = {};

for (const code of localeCodes)
{
    output[code] = {}

    for (const lang of languages)
    {
        // do not default to english - client will do that
        // remove whitespace and notes
        if (translations[lang].find(e => e[0] == code))
            output[code][lang] = translations[lang].find(e => e[0] == code)[1].trim().split(';')[0];
        else
            output[code][lang] = "";
    }
}

fs.writeFileSync('../data/locale.json', JSON.stringify(output, null, 4))

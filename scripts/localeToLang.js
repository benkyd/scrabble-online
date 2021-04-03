// to take the locale.json and split into seperate langauge files for 
// easy contribution of translations

// DOES NOT PARSE, WILL OVERWRITE LANG FILES

const fs = require('fs');

const localeJSONRaw = fs.readFileSync('../data/locale.json');
const localeJSON = JSON.parse(localeJSONRaw);

let localeCodes = [];
let languages = [];

for (const localeCode in localeJSON)
{
    localeCodes.push(localeCode);

    for (const lang in localeJSON[localeCode])
    {
        if (!languages.includes(lang))
            languages.push(lang);
    }
}

// good enough lol
localeCodes = localeCodes.sort();

for (let lang in languages)
{
    // if there is already a language file for this language, parse it and only put in the new locale codes
    // if (fs.existsSync(`../data/${languages[lang]}.lang`))
    // {
    //     let localeCodesFromLangFile = fs.readFileSync(`../data/${languages[lang]}.lang`).toString();
    //     localeCodesFromLangFile = localeCodesFromLangFile.split('----')[1].split('\n');
        
    //     console.log(localeCodesFromLangFile);

    // }

    let toWrite = '';
    for (const code of localeCodes)
    {
        if (localeJSON[code][languages[lang]])
        {
            toWrite += code + ':' + localeJSON[code][languages[lang]] + '\n';
        } else 
        {
            toWrite += code + ':' + localeJSON[code]['en'] + '\n';
        }
    }

    fs.writeFileSync(`../data/${languages[lang]}.lang`, toWrite);
}


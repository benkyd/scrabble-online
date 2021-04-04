// to update all other languages files based on the english file (for new locale codes)

// warning: sphagettie code

const fs = require('fs');

let languagesNotEn = [];
fs.readdirSync('../data/').map(e => {
    if (e.endsWith('.lang') && !e.includes('en')) languagesNotEn.push(e.split('.')[0]);
});

const newEnHeader = fs.readFileSync('../data/en.lang').toString().split('----')[0] + '----';
const sortedKeyValueEn = fs.readFileSync('../data/en.lang').toString()
                                                           .split('----')[1]
                                                           .split('\n')
                                                           .sort((a, b) => {
                                                               // sort by code only
                                                               a = a.split(':')[0];
                                                               b = b.split(':')[0];
                                                               if (a < b)
                                                                   return -1;
                                                               if (a > b)
                                                                   return 1;
                                                               return 0;
                                                           })
                                                           .join('\n');

fs.writeFileSync('../data/en.lang', (newEnHeader + sortedKeyValueEn));

const codesInEn = fs.readFileSync('../data/en.lang').toString()
                                                    .split('----')[1]
                                                    .split('\n')
                                                    .map(e => e.split(':')[0])
                                                    .filter(e => e != null && e != '')
                                                    .sort();

for (const lang of languagesNotEn)
{
    const newLangHeader = fs.readFileSync(`../data/${lang}.lang`).toString().split('----')[0] + '----\n';
    const codesInLang = fs.readFileSync(`../data/${lang}.lang`).toString()
                                                               .split('----')[1]
                                                               .split('\n')
                                                               .map(e => e.split(':')[0])
                                                               .filter(e => e != null && e != '')
                                                               .sort();
    
    let output = fs.readFileSync(`../data/${lang}.lang`).toString().split('----')[1];
    
    let newCodes = [];
    for (const code in codesInEn)
    {
        if (!codesInLang.includes(codesInEn[code]))
        {
            newCodes.push(codesInEn[code]);
        }
    }

    for (const code of newCodes)
        output += '\n' + code + ':\n';

    output = output.split('\n').sort((a, b) => {
            // sort by code only
            a = a.split(':')[0];
            b = b.split(':')[0];
            if (a < b)
                return -1;
            if (a > b)
                return 1;
            return 0;
    }).filter(e => e != null && e != '').join('\n');

    fs.writeFileSync(`../data/${lang}.lang`, newLangHeader + output);
}

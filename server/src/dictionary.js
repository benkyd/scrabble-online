
const Logger = require('./logger.js');

const FS = require('fs');


/*
DICTIONARY OBJECT
{
    lang: code,
    optimised: true,
    data: {}
}
NOTES
    - Data can be hashmap (not actually a hashmap, because JS or 
        n-ary tree, findword deals with this based on the optimised flag
*/
let Dictionaries = [];

function LoadTextDictionaries()
{
    Logger.info('LOADING SCRABBLE DICTIONARIES');

    let langsToLoad = [];
    FS.readdirSync('../data/').map(e => {
        if (e.endsWith('.dict')) langsToLoad.push(e);
    });

    for (let lang of langsToLoad)
    {
        Logger.info(`LOADING ${lang} ...`);
        Dictionaries.push({
            lang: lang.split('-')[0],
            optimised: false,
            data: FS.readFileSync(`../data/${lang}`).toString().split('\n')
        });
    }
}

function Optimise()
{

}

function FindWord(lang, word)
{
    word = word.toUpperCase();

    let ret = false;
    for (const language of Dictionaries)
    {
        if (language.lang !== lang) continue;
        

        if (language.optimised)
        {

        } else 
        {
            if (language.data.includes(word)) ret = true;
        }
    }

    return ret;
}


module.exports = {
    LoadTextDictionaries: LoadTextDictionaries,
    Optimise: Optimise,
    FindWord: FindWord
};

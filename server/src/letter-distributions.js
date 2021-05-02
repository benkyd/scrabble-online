
const Logger = require('./logger.js');

//https://en.wikipedia.org/wiki/Scrabble_letter_distributions

/*
DISTRIBUTIONS OBJECT
{
    tileset: [],
    blanktiles: int,
    lettercount: int,
    dist: [
        {points: 1, letters: [], amounts: []},
        {points: 2, letters: [], amounts: []}
        ...
    ]
}
NOTES
    - TODO: JSON-ise it
*/
let Distributions = [];

Distributions['en'] = {
    tileset: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    blanktiles: 2,
    lettercount: 100,
    dist: [
        {
            points: 1,
            letters: ['E', 'A', 'I', 'O', 'N', 'R', 'T', 'L', 'S', 'U'],
            amounts: [12, 9, 9, 8, 6, 6, 6, 4, 4, 4]
        },
        {
            points: 2,
            letters: ['D', 'G'],
            amounts: [4, 3]
        },
        {
            points: 3,
            letters: ['B', 'C', 'M', 'P'],
            amounts: [2, 2, 2, 2]
        },
        {
            points: 4,
            letters: ['F', 'H', 'V', 'W', 'Y'],
            amounts: [2, 2, 2, 2, 2]
        },
        {
            points: 5,
            letters: ['K'],
            amounts: [1]
        },
        {
            points: 8,
            letters: ['J', 'X'],
            amounts: [1, 1]
        },
        {
            points: 8,
            letters: ['Q', 'Z'],
            amounts: [1, 1]
        }
    ]
};

Distributions['pt'] = {
    tileset: ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Z'],
    blanktiles: 3,
    lettercount: 120,
    dist: [
        {
            points: 1,
            letters: ['A', 'E', 'I', 'O', 'S', 'U', 'M', 'R', 'T'],
            amounts: [14, 11, 10, 10, 8, 7, 6, 6, 5]
        },
        {
            points: 2,
            letters: ['D', 'L', 'C', 'P'],
            amounts: [5, 5, 4, 4]
        },
        {
            points: 3,
            letters: ['N', 'B', 'Ç'],
            amounts: [4, 3, 2]
        },
        {
            points: 4,
            letters: ['F', 'G', 'H', 'V'],
            amounts: [2, 2, 2, 2]
        },
        {
            points: 5,
            letters: ['J'],
            amounts: [2]
        },
        {
            points: 6,
            letters: ['Q'],
            amounts: [1]
        },
        {
            points: 8,
            letters: ['X', 'Z'],
            amounts: [1, 1]
        }
    ]
};

Distributions['es'] = {
    tileset: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L', 'LL', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'RR', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', 'CH'],
    blanktiles: 2,
    lettercount: 100,
    dist: [
        {
            points: 1,
            letters: ['A', 'E', 'O', 'I', 'S', 'N', 'R', 'U', 'L', 'T'],
            amounts: [12, 12, 9, 6, 6, 5, 5, 5, 4, 4]
        },
        {
            points: 2,
            letters: ['D', 'G'],
            amounts: [5, 2]
        },
        {
            points: 3,
            letters: ['C', 'B', 'M', 'P'],
            amounts: [4, 2, 2, 2]
        },
        {
            points: 4,
            letters: ['H', 'F', 'V', 'Y'],
            amounts: [2, 1, 1, 1]
        },
        {
            points: 5,
            letters: ['CH', 'Q'],
            amounts: [1, 1]
        },
        {
            points: 8,
            letters: ['J', 'LL', 'Ñ', 'RR', 'X'],
            amounts: [1, 1, 1, 1, 1]
        },
        {
            points: 10,
            letters: ['Z'],
            amounts: [1]
        }
    ]
};

Distributions['fr'] = {
    tileset: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    blanktiles: 2,
    lettercount: 102,
    dist: [
        {
            points: 1,
            letters: ['E', 'A', 'I', 'N', 'O', 'R', 'S', 'T', 'U', 'L'],
            amounts: [15, 9, 8, 6, 6, 6, 6, 6, 6, 5]
        },
        {
            points: 2,
            letters: ['D', 'M', 'G'],
            amounts: [3, 3, 2]
        },
        {
            points: 3,
            letters: ['B', 'C', 'P'],
            amounts: [2, 2, 2]
        },
        {
            points: 4,
            letters: ['F', 'H', 'V'],
            amounts: [2, 2, 2]
        },
        {
            points: 8,
            letters: ['J', 'Q'],
            amounts: [1, 1]
        },
        {
            points: 10,
            letters: ['K', 'W', 'X', 'Y', 'Z'],
            amounts: [1, 1, 1, 1, 1]
        }
    ]
};

Distributions['cs'] = {
    tileset: ['A', 'Á', 'B', 'C', 'Č', 'D', 'Ď', 'E', 'É', 'Ě', 'F', 'G', 'H', 'I', 'Í', 'J', 'K', 'L', 'M', 'N', 'Ň', 'O', 'Ó', 'P', 'R', 'Ř', 'S', 'Š', 'T', 'Ť', 'U', 'Ú', 'Ů', 'V', 'X', 'Y', 'Ý', 'Z', 'Ž'],
    blanktiles: 2,
    lettercount: 100,
    dist: [
        {
            points: 1,
            letters: ['O', 'A', 'E', 'N', 'I', 'S', 'T', 'V', 'D', 'K', 'L', 'P', 'R'],
            amounts: [6, 5 ,5 ,5, 4, 4, 4, 4, 3, 3, 3, 3, 3]
        },
        {
            points: 2,
            letters: ['C', 'H', 'Í', 'M', 'U', 'Á', 'J', 'Y', 'Z'],
            amounts: [3, 3, 3, 3, 3, 2, 2, 2, 2]
        },
        {
            points: 3,
            letters: ['B', 'É', 'Ě'],
            amounts: [2, 2, 2]
        },
        {
            points: 4,
            letters: ['Ř', 'Š', 'Ý', 'Č', 'Ů', 'Ž'],
            amounts: [2, 2, 2, 1, 1, 1]
        },
        {
            points: 5,
            letters: ['F', 'G', 'Ú'],
            amounts: [1, 1, 1]
        },
        {
            points: 6,
            letters: ['Ň'],
            amounts: [1]
        },
        {
            points: 7,
            letters: ['Ó', 'Ť'],
            amounts: [1, 1]
        },
        {
            points: 8,
            letters: ['Ď'],
            amounts: [1]
        },
        {
            points: 8,
            letters: ['X'],
            amounts: [1]
        },
    ]
};

function GetDist(locale)
{
    return Distributions[locale];
}

function GetTileSet(locale)
{
    return Distributions[locale].tileset;
}

function GenerateStartStateDistribution(locale)
{
    const loc = Distributions[locale];

    let ret = [];

    // loops over every point object and adds j amount of i letter
    // to ret for the game board
    for (let p of loc.dist)
        for (let i = 0; i < p.letters.length; i++)
            for (let j = 0; j < p.amounts[i]; j++)
                ret.push(p.letters[i]);

    for (let i = 0; i < loc.blanktiles; i++)
        ret.push('_');

    return ret;
}


module.exports = {
    Distributions: Distributions,

    GetDist: GetDist,
    GetTileSet: GetTileSet,
    GenerateStartStateDistribution: GenerateStartStateDistribution
};

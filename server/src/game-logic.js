const Logger = require('./logger.js');
const Registrar = require('./game-registrar.js');
const Lobbies = require('./lobbies.js');
const Dist = require('./letter-distributions.js');
const Helpers = require('./helpers.js');

/*
GAME OBJECT
{
    // Reference UID (of lobby)
    uid: uid,
    locale: en,
    players: [{
        uid: uid,
        name: username,
        activetiles: [tile: {
            letter: letter,
            score: int
        }],
        score: int
    }],
    // Index of players whos turn it is
    turn: int,
    turntotal: int,
    // Array of GAMESTATEs, latest at head of array
    gamestates: [],
    tilebag: [],
    tileset: []
}
GAMESTATE OBJECT
{
    // UID of the player that played the turn
    playeruid: uid,
    turn: int,
    // SKIP, PLACE, EXCHANGE
    turntype: 'SKIP',
    // Generated after turn is processed
    outcome: {
        valid: bool,
        points: pointsgained,
        words: [{ 
            word: word,
            points: points,
            tiles: [{
                pos: {x: x, y: y},
                modifier: modifier,
                letter: letter,
                score: int
            }]
        }],
    }
    oldboardtiles: [{
        pos: {x: x, y: y},
        modifier: modifier,
        letter: letter,
        score: int
    }]
    boardtiles: [{
        pos: {x: x, y: y},
        modifier: modifier,
        letter: letter,
        score: int
    }]
}
NOTES
    - The locale is the language of the *owner of the lobby*, the dictionary
        will reflect this language choice
    - TILESET is a lookup table for tiles: scores, derived from the locale's
        score thing in letter-distributions.js TILEBAG is not to be confused
        with tileset as those are active game tiles and are modified as turns
        are played
    - A GAMESTATE refers to a turn
*/
let ActiveGames = [];

// Mirrors client's one
// This was automatically generated, the code for it is lonnnggg gone
const BoardLocations = {
    "0,0": "TW",
    "0,3": "DL",
    "0,7": "TW",
    "0,11": "DL",
    "0,14": "TW",
    "1,1": "DW",
    "1,5": "TL",
    "1,9": "TL",
    "1,13": "DW",
    "2,2": "DW",
    "2,6": "DL",
    "2,8": "DL",
    "2,12": "DW",
    "3,0": "DL",
    "3,3": "DW",
    "3,7": "DL",
    "3,11": "DW",
    "3,14": "DL",
    "4,4": "DW",
    "4,10": "DW",
    "5,1": "TL",
    "5,5": "TL",
    "5,9": "TL",
    "5,13": "TL",
    "6,2": "DL",
    "6,6": "DL",
    "6,8": "DL",
    "6,12": "DL",
    "7,0": "TW",
    "7,3": "DL",
    "7,7": "★",
    "7,11": "DL",
    "7,14": "TW",
    "8,2": "DL",
    "8,6": "DL",
    "8,8": "DL",
    "8,12": "DL",
    "9,1": "TL",
    "9,5": "TL",
    "9,9": "TL",
    "9,13": "TL",
    "10,4": "DW",
    "10,10": "DW",
    "11,0": "DL",
    "11,3": "DW",
    "11,7": "DL",
    "11,11": "DW",
    "11,14": "DL",
    "12,2": "DW",
    "12,6": "DL",
    "12,8": "DL",
    "12,12": "DW",
    "13,1": "DW",
    "13,5": "TL",
    "13,9": "TL",
    "13,13": "DW",
    "14,0": "TW",
    "14,3": "DL",
    "14,7": "TW",
    "14,11": "DL",
    "14,14": "TW"
};


function GetGameByUserUID(useruid)
{
    for (const game in ActiveGames)
        for (const player of ActiveGames[game].players)
            if (player.uid === useruid) return ActiveGames[game];

    return false;
}

function GetGameUserByUserUID(useruid)
{
    for (const game in ActiveGames)
        for (const player of ActiveGames[game].players)
            if (player.uid === useruid) return player;

    return false;
}

function GetTurnUser(gameuid)
{
    if (!ActiveGames[gameuid]) return false;
    return ActiveGames[gameuid].players[ActiveGames[gameuid].turn];
}


function BeginGame(lobby)
{
    // game uses the owners language - assumes it's valid
    const gameowner = Registrar.GetUserByUID(lobby.owneruid);

    let tilebag = Dist.GenerateStartStateDistribution(gameowner.locale);

    let players = lobby.players.map(i => { return {
        uid: i.uid, 
        name: i.name,
        activetiles: [],
        score: 0
    }});
    
    // shuffle for turn order
    players = Helpers.ShuffleArray(players);
    
    // populate users tile drawer
    for (const player in players)
    {
        // start all players with 7 random tiles
        for (let i = 0; i < 6; i++)
        {
            let t, r;
            do {
                // TODO: this goes out of range
                r = Math.floor(Math.random() * tilebag.length + 1);
                t = tilebag[r];
            } while (t === undefined)
            tilebag.splice(r, 1);
            players[player].activetiles.push(t);
        }
        players[player].activetiles.push('_');

    }

    const gamestate = {
        playeruid: -1,
        turn: 0,
        turntype: '',
        outcome: {
            valid: false
        },
        oldboardtiles: [],
        boardtiles: []
    };

    ActiveGames[lobby.uid] = {
        uid: lobby.uid,
        locale: gameowner.locale,
        players: players,
        turn: 0,
        turntotal: 0,   
        gamestates: [gamestate],
        tilebag: tilebag,
        tileset: Dist.GetTileSet(gameowner.locale)
    };

    return ActiveGames[lobby.uid];
}

/*
TURN OBJECT - Un-filled in GAMESTATE object
{
    // UID of the player that played the turn
    playeruid: uid,
    turn: int,
    // SKIP, PLACE, EXCHANGE
    turntype: 'SKIP',
    // Generated after turn is processed
    outcome: {
        valid: bool,
        points: pointsgained,
        words: [{ 
            word: word,
            points: points,
            tiles: [{
                pos: {x: x, y: y},
                modifier: modifier,
                letter: letter,
                score: int
            }]
        }],
    }
    oldboardtiles: [{
        pos: {x: x, y: y},
        modifier: modifier,
        letter: letter,
        score: int
    }]
    boardtiles: [{
        pos: {x: x, y: y},
        modifier: modifier,
        letter: letter,
        score: int
    }]
}
NOTES
    - Turns are handled a little weird, client sends turn on turn end and
        this function validates it and changes the state of the game before
        returning an error or a validation object including the next players
        turn
*/
// Does not trust client's oldboardtiles
function PlayTurn(gameuid, playeruid, turn)
{
    const game = ActiveGames[gameuid];
    const turninfo = gameNextTurn(gameuid);

    turn.turn = turninfo.newTurn;
    turn.oldboardtiles = ActiveGames[gameuid].gamestates[ActiveGames[gameuid].gamestates.length - 1].boardtiles;

    // generate diff between oldboardtiles and newboardtiles
    const diff = turnDiff(turn.oldboardtiles, turn.boardtiles);
    if (diff.length === 0)
    {
        const error = {
            error: 'error-game-no-change'
        };
        return [error, undefined, undefined, undefined] 
    }

    // check if user is allowed to make that move
    const gameplayer = GetGameUserByUserUID(playeruid);
    for (const newpiece of diff)
    {
        if (!gameplayer.activetiles.includes(newpiece.letter))
        {
            // If they've got a wild card
            if (gameplayer.activetiles.includes('_'))
            {
                // make sure it's actually allowed
                const tileset = Dist.GetDist(game.locale).dist;
                const tilesetincludes = (l) => {
                    for (const range of tileset)
                        if (range.letters.includes(l)) return true;
                    return false;
                };

                if (!tilesetincludes(newpiece.letter))
                {
                    const error = {
                        error: 'error-game-illegal-move'
                    };
                    return [error, undefined, undefined, undefined] 
                }

                // then replace it and continue
                const replacer = gameplayer.activetiles.indexOf('_');
                gameplayer.activetiles[replacer] = newpiece.letter;
            } else
            {
                const error = {
                    error: 'error-game-illegal-move'
                };
                return [error, undefined, undefined, undefined] 
            }
        }
    }

    // process outcome
    const temptiles = turn.oldboardtiles.concat(turn.boardtiles);
    // algorithm for getting words
    // let words = [];
    // for (const newpiece of diff)
    // {
    //     const traverse = (frompiece, direction, word) => {
    //         // check up, down, left, right for others
    //         const check = (x, y) => {
    //             for (const checkpiece of temptiles)
    //             {
    //                 if (!checkpiece.visited) checkpiece.visited = false;
    //                 // console.log(checkpiece);
    //                 // there's a piece there
    //                 if (checkpiece.pos.x === x && checkpiece.pos.y === y && checkpiece.visited === false)
    //                 {
    //                     console.log(word);
    //                     temptiles[temptiles.indexOf(checkpiece)].visited = true;
    //                     console.log(temptiles);
    //                     return traverse(checkpiece, direction, word + checkpiece.letter);
    //                 }
    //                 return word;
    //             }
    //         }
    
    //         if (direction === 0)
    //         {
    //             let up    = check(frompiece.pos.x    , frompiece.pos.y + 1);
    //             words.push(up);
    //         }
    //         if (direction === 0)
    //         {
    //             let right = check(frompiece.pos.x + 1, frompiece.pos.y    );
    //             words.push(right);
    //         }
    //         if (direction === 0)
    //         {
    //             let down  = check(frompiece.pos.x    , frompiece.pos.y - 1);
    //             words.push(down);
    //         }
    //         if (direction === 0)
    //         {
    //             let left  = check(frompiece.pos.x - 1, frompiece.pos.y    );
    //             words.push(left);
    //         }

    //         return word;
    //     }
    //     // traverse from the piece in all directions
    //     traverse(newpiece, 0, newpiece.letter);
    //     traverse(newpiece, 1, newpiece.letter);
    //     traverse(newpiece, 2, newpiece.letter);
    //     traverse(newpiece, 3, newpiece.letter);
    // }
    // console.log(words);

    // const traverse = (x, y, direction, acc) => {
        
    //     console.log(temptiles)
    //     for (const checkpiece of temptiles)
    //     {
    //         if (direction === 0)
    //         {
    //             if (x === checkpiece.pos.x && y + 1 === checkpiece.pos.y)
    //             {
    //                 return traverse(x, y + 1, direction, acc + checkpiece.letter);
    //             }
    //         }
    //         if (direction === 1)
    //         {
    //             if (x + 1 === checkpiece.pos.x && y === checkpiece.pos.y)
    //             {
    //                 return traverse(x + 1, y, direction, acc + checkpiece.letter);
    //             }
    //         }
    //         if (direction === 2)
    //         {
    //             if (x === checkpiece.pos.x && y - 1 === checkpiece.pos.y)
    //             {
    //                 return traverse(x, y - 1, direction, acc + checkpiece.letter);
    //             }
    //         }
    //         if (direction === 3)
    //         {
    //             if (x - 1 === checkpiece.pos.x && y === checkpiece.pos.y)
    //             {
    //                 return traverse(x - 1, y, direction, acc + checkpiece.letter);
    //             }
    //         }
    //         return acc;
    //     }

    // }

    // for (const newpiece of diff)
    // {
    //     let wordsFromPiece = [];
    //     wordsFromPiece.push(traverse(newpiece.pos.x, newpiece.pos.y, 0, newpiece.letter));
    //     wordsFromPiece.push(traverse(newpiece.pos.x, newpiece.pos.y, 1, newpiece.letter));
    //     wordsFromPiece.push(traverse(newpiece.pos.x, newpiece.pos.y, 2, newpiece.letter));
    //     wordsFromPiece.push(traverse(newpiece.pos.x, newpiece.pos.y, 3, newpiece.letter));
    //     console.log(wordsFromPiece);
    // }

    // Attempt #3 with 3 hours before the deadline

    // no recursion this time

    let words = [];
    for (const newpiece of diff)
    {

        const check = (x, y) => {
            for (const checkpiece of temptiles)
            {
                if (checkpiece.pos.x === x && checkpiece.pos.y === y)
                    return checkpiece;
            }
            return false;
        };

        const directions = [
            {x: -1, y: 0},
            {x: 1, y: 0},
            {x: 0, y: -1},
            {x: 0, y: 1}
        ];

        // if piece is in the middle of used pieces, ignore it
        let clashes = 0;
        for (const newpiecetmp of diff)
        {
            if (newpiece.pos.x + 1 === newpiecetmp.pos.x && newpiece.pos.y === newpiecetmp.pos.y) clashes++;
            if (newpiece.pos.x === newpiecetmp.pos.x && newpiece.pos.y + 1 === newpiecetmp.pos.y) clashes++;
            if (newpiece.pos.x - 1 === newpiecetmp.pos.x && newpiece.pos.y === newpiecetmp.pos.y) clashes++;
            if (newpiece.pos.x === newpiecetmp.pos.x && newpiece.pos.y - 1 === newpiecetmp.pos.y) clashes++;
        }
        if (clashes > 1) continue;

        for (let i = 0; i < 4; i++)
        {
            let word = '';
            const direction = directions[i];
            
            let coords = {x: newpiece.pos.x, y: newpiece.pos.y};
            while(true)
            {
                const ret = check(coords.x, coords.y);
                // console.log(ret);
                if (ret === false)
                    break;
                word += ret.letter;
                coords.x += direction.x;
                coords.y += direction.y;
            }
            if (word.length === 1) continue;
            words.push(word);
            console.log(word);
        }
    }

    // remove same-in-reverse words
    for (const word in words)
    {
        const reverse = words[word].split('').reverse().join('');
        if (words.includes(reverse))
            words.splice(word, 1); 
    }

    console.log(words);

    // update tiles with scores
    turn.boardtiles = turn.oldboardtiles.concat(turn.boardtiles);
    for (const tile in turn.boardtiles)
    {
        let score = 0;
        for (const pointband of Dist.GetDist(game.locale).dist)
        {
            if (pointband.letters.includes(turn.boardtiles[tile].letter))
            {
                score = pointband.points;
                break;
            }
        }
        turn.boardtiles[tile].score = score;
    }

    // process turn and allocate scores

    // for every new word
    // calculate based on TL/DL/DW/TW and tile score the score
    // send to client


    // give user new tiles


    ActiveGames[gameuid].gamestates.push(turn);
    ActiveGames[gameuid].turn = turninfo.newTurn;
    ActiveGames[gameuid].turntotal = turninfo.newTotalTurn;
    
    return [undefined, turn, turninfo, {}];
}

function SkipTurn(gameuid, playeruid)
{
    const turninfo = gameNextTurn(gameuid);
    // get last game state
    const turn = {
        playeruid: playeruid,
        turn: turninfo.newTurn,
        turntype: 'SKIP',
        outcome: {},
        oldboardtiles: ActiveGames[gameuid].gamestates[ActiveGames[gameuid].gamestates.length - 1],
        boardtiles: ActiveGames[gameuid].gamestates[ActiveGames[gameuid].gamestates.length - 1]
    };
    
    ActiveGames[gameuid].gamestates.push(turn);
    ActiveGames[gameuid].turn = turninfo.newTurn;
    ActiveGames[gameuid].turntotal = turninfo.newTotalTurn;
    
    return [turn, turninfo];
}

function gameNextTurn(gameuid)
{
    const playerCount = ActiveGames[gameuid].players.length;
    let newTurn = ActiveGames[gameuid].turn += 1;
    newTurn = ActiveGames[gameuid].turn % playerCount;
    const newTotalTurn = ActiveGames[gameuid].turntotal += 1;

    return {
        turnplayer: ActiveGames[gameuid].players[newTurn],
        newTurn: newTurn,
        newTotalTurn: newTotalTurn
    };
}

// same as how the 
function EndGame(gameuid)
{
    delete ActiveGames[gameuid];    
}


// verrryyy naive way of doing it but it returns the difference in tiles between args
function turnDiff(turntilesold, turntilesnew)
{
    let ret = [];
    if (turntilesold.length === 0) return turntilesnew;
    if (turntilesnew.length === 0) return []; // because there's no new tiles ennit
    for (const tile1 of turntilesold)
    {
        for (const tile2 of turntilesnew)
        {
            if (JSON.stringify(tile1) === JSON.stringify(tile2))
                continue;
            if (ret.includes(tile2) || ret.includes(tile1))
                continue;
            ret.push(tile2);
        }
    }
    return ret;
}


module.exports = {
    // Game validation exports

    // Get game exports
    GetGameByUserUID: GetGameByUserUID,
    GetGameUserByUserUID: GetGameUserByUserUID,
    GetTurnUser: GetTurnUser,

    // Change game state exports
    BeginGame: BeginGame,
    PlayTurn: PlayTurn,
    SkipTurn: SkipTurn,
    EndGame: EndGame
}

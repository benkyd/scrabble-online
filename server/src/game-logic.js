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


function GetGameByUserUID(useruid)
{
    for (const game in ActiveGames)
        for (const player of ActiveGames[game].players)
            if (player.uid === useruid) return ActiveGames[game];

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
        for (let i = 0; i < 7; i++)
        {
            let r = Math.floor(Math.random() * tilebag.length + 1);
            let t = tilebag[r];
            tilebag.splice(r, 1);
            players[player].activetiles.push(t);
        }
    }

    const gamestate = {
        playeruid: -1,
        turn: 0,
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
function PlayTurn(gameuid, playeruid, newstate)
{

}

// returns tuple ([newtileset], [newusertiles])
function ExchangeTiles(tileset, tilesToExchange)
{

}


module.exports = {
    // Game validation exports

    // Get game exports
    GetGameByUserUID: GetGameByUserUID,
    GetTurnUser: GetTurnUser,

    // Change game state exports
    BeginGame: BeginGame,
    PlayTurn: PlayTurn
}

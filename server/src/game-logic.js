const Logger = require('./logger.js');
const Registrar = require('./game-registrar.js');
const Lobbies = require('./lobbies.js');
const Dist = require('./letter-distributions.js');
const Helpers = require('./helpers.js');

/*
GAME OBJECT
{
    // reference UID
    lobbyuid: uid,
    locale: en,
    players: [{
        uid: uid,
        name: username,
        activetiles: [tile: {
            tile: tile, 
            score: int
        }],
        score: int
    }],
    // index of players
    turn: int,
    tilebag: [],
    tileset: []
}
NOTES
    - The locale is the language of the *owner of the lobby*, the dictionary
        will reflect this language choice
    - TILESET is a lookup table for tiles: scores, derived from the locale's
        score thing in letter-distributions.js TILEBAG is not to be confused
        with tileset as those are active game tiles and are modified as turns
        are played
*/
let ActiveGames = [];


function StartGame(lobby)
{
    // game uses the owners language
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

    ActiveGames[lobby.uid] = {
        lobbyuid: lobby.uid,
        locale: gameowner.locale,
        players: players,
        turn: 0,
        tilebag: tilebag
    };

    console.log(ActiveGames[lobby.uid]);

    return ActiveGames[lobby.uid];
}

// returns tuple ([newtileset], [newusertiles])
function ExchangeTiles(tileset, tilesToExchange)
{

}

// does not alter tileset
function SelectTilesFromBag(tileset, num)
{

}


module.exports = {
    StartGame: StartGame,
}

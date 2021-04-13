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
    players: [{uid, name, activetiles, score}],
    // index of players
    turn: int,
    tilebag: []
}
NOTES
    - The locale is the language of the *owner of the lobby*, the dictionary
        will reflect this language choice
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
    
    console.log(players)

    // populate users tile drawer

    ActiveGames[lobby.uid] = {
        lobbyuid: lobby.uid,
        locale: gameowner.locale,
        players: players,
        turn: 0,
        tilebag: tilebag
    };


    return ActiveGames[lobby.uid];
}

// returns tuple ([newtileset], [newusertiles])
function ExchangeTiles(tileset, tilesToExchange)
{

}


module.exports = {
    StartGame: StartGame,
}

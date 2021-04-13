const Logger = require('./logger.js');
const Registrar = require('./game-registrar.js');
const Lobbies = require('./lobbies.js');

/*
GAME OBJECT
{
    // reference UID
    lobbyuid: uid,
    locale: en,
    players: [{uid, activetiles, score}],
    // index of players
    turn: int,
    // TODO: vvv
    turnstate: 
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

    

    ActiveGames[lobby.uid] = {
        lobbyuid: lobby.uid,
        locale: gameowner.locale,

        turn: 0,
        
    };

}


module.exports = {
    StartGame: StartGame,
}

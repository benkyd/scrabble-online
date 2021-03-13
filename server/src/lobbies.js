const Logger = require('./logger.js');


/* 
LOBBY OBJECT
{
    uid: uid,
    name: string
    owneruid: useruid,
    players: [uids],
    spectators: [uids],
    // PUBLIC, PRIVATE
    visibility: 'PUBLIC',
    allowspectators: bool,
    // OPEN, CLOSED, INGAME
    state: 'OPEN'
}
NOTES
    - Users can only own one lobby
    - Lobby UID is "join code", will be much shorter than userid
    - When inactive will be deleted, unlike users
*/
let Lobbies = [];


function CheckUserAvailability(ownerid)
{
    for (const lobby in Lobbies)
        if (Lobbies[lobby].ownerid == ownerid) return false;
    return true;
}


function RegisterLobby(owneruid, name, private, spectators)
{
    if (!CheckUserAvailability(owneruid)) return false;

    // Easy to remember and to read out to friends, not very unique though
    // will def need to do some checking
    // TODO: ^that
    const uid = Math.random().toString(36).substring(7).toUpperCase();

}

function DeRegisterLobby(lobbyid)
{

}


module.exports = {
    CheckUserAvailability: CheckUserAvailability,

    RegisterLobby: RegisterLobby,
    DeRegisterLobby: DeRegisterLobby
}

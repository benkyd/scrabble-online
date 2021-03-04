const Logger = require('./logger.js');


/* 
LOBBY OBJECT
{
    uid: uid,
    ownerid: userid,
    // PUBLIC, PRIVATE
    visibility: 'PUBLIC',
    allowspectators: bool,
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


function RegisterLobby(ownerid, name, private, spectators)
{
    if (!CheckUserAvailability(ownerid)) return false;

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

const Logger = require('./logger.js');


/* 
LOBBY OBJECT
{
    uid: uid,
    name: string
    owneruid: useruid,
    players: [{uid, name}],
    spectators: [{uid, name}],
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


function CheckUserAvailability(owneruid)
{
    // if user owns lobby
    for (const lobby in Lobbies)
        if (Lobbies[lobby].owneruid == owneruid) return false;

    // if user is in any lobbies already

    return true;
}


function GetLobbyByUID(lobbyUID)
{
    return Lobbies[lobbyUID];
}

function GetLobbyByUserUID(owneruid)
{
    for (const lobby in Lobbies)
        if (Lobbies[lobby].owneruid == owneruid) return Lobbies[lobby];
    return false;
}


function RegisterLobby(owneruid, name, private, spectators)
{
    if (!CheckUserAvailability(owneruid)) return false;

    // Easy to remember and to read out to friends, not very unique though
    // will def need to do some checking
    // TODO: ^that
    const uid = Math.random().toString(36).substring(7).toUpperCase();

    Lobbies[uid] = {
        uid: uid,
        name: name,
        owneruid: owneruid,
        players: [], // Owner should join lobby seperately
        spectators: [],
        visibility: private ? "PRIVATE" : "PUBLIC",
        allowspectators: spectators,
        state: 'OPEN'
    };

    return Lobbies[uid];

}

function DeRegisterLobby(lobbyid)
{

}


module.exports = {
    CheckUserAvailability: CheckUserAvailability,

    GetLobbyByUID: GetLobbyByUID,
    GetLobbyByUserUID: GetLobbyByUserUID,

    RegisterLobby: RegisterLobby,
    DeRegisterLobby: DeRegisterLobby
}

const Logger = require('./logger.js');
const Registrar = require('./game-registrar.js');

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
    - It's a waste of memory to store the name along with the useruid, however
        i believe it will save complexity in the domain logic
*/
let Lobbies = [];


function CheckUserAvailability(useruid)
{
    for (const lobby in Lobbies)
    {
        // if user owns lobby
        if (Lobbies[lobby].owneruid === useruid) return false;
        // if user is in any lobbies already
        if (Lobbies[lobby].players.includes(useruid)) return false;
        // if user is spectating any lobbies already
        if (Lobbies[lobby].spectators.includes(useruid)) return false;
    }

    return true;
}

function IsUserInLobby(useruid)
{
    for (const lobby in Lobbies)
    {
        // if user is in any lobbies already
        if (Lobbies[lobby].players.includes(useruid)) return true;
        // if user is spectating any lobbies already
        if (Lobbies[lobby].spectators.includes(useruid)) return true;
    }

    return false;
}

function DoesUserOwnLobby(lobbyuid, useruid)
{
    if (!Lobbies[lobbyuid]) return false;
    if (Lobbies[lobbyuid].owneruid === useruid) return true;
    return false;
}


function GetLobbyByUID(lobbyuid)
{
    return Lobbies[lobbyuid];
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

function DeRegisterLobby(lobbyuid)
{
    delete Lobbies[lobbyuid];
}

function UserJoinLobby(lobbyuid, useruid)
{
    if (IsUserInLobby(useruid)) return false;
    if (!Lobbies[lobbyuid]) return false;
    if (!Registrar.GetUserByUID(useruid)) return false;

    Lobbies[lobbyuid].players.push({uid: useruid, name: Registrar.GetUserByUID(useruid).username});

    return GetLobbyByUID(lobbyuid);
}

function SpectatorJoinLobby(lobbyuid, useruid)
{

}


module.exports = {
    // Lobby validation exports
    CheckUserAvailability: CheckUserAvailability,
    DoesUserOwnLobby: DoesUserOwnLobby,
    IsUserInLobby: IsUserInLobby,

    // Get lobby exports
    GetLobbyByUID: GetLobbyByUID,
    GetLobbyByUserUID: GetLobbyByUserUID,

    // Change lobby state exports
    RegisterLobby: RegisterLobby,
    DeRegisterLobby: DeRegisterLobby,
    UserJoinLobby: UserJoinLobby,
    SpectatorJoinLobby: SpectatorJoinLobby
}

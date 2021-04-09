const Logger = require('./logger.js');
const Registrar = require('./game-registrar.js');
const { GetUserByUID } = require('./game-registrar.js');

/* 
LOBBY OBJECT
{
    uid: uid,
    name: string
    owneruid: useruid,
    players: [{uid, name, ready}],
    spectators: [{uid, name}],
    // PUBLIC, PRIVATE
    visibility: 'PUBLIC',
    allowspectators: bool,
    // OPEN, CLOSED, INGAME
    state: 'OPEN'
}
NOTES
    - Users can only own one lobby
    - Lobby UID is "join code", will be much shorter than useruid
    - When inactive will be deleted, unlike users
    - It's a waste of memory to store the name along with the useruid, however
        i believe it will save complexity in the domain logic
    - All players must be ready in order for a game to start
*/
let Lobbies = [];


function CheckUserAvailability(useruid)
{
    for (const lobby in Lobbies)
    {
        // if user owns lobby
        if (Lobbies[lobby].owneruid === useruid) return false;
        // if user is in any lobbies already
        for (const player of Lobbies[lobby].players)
            if (player.uid === useruid) return false;
        // if user is spectating any lobbies already
        for (const player of Lobbies[lobby].spectators)
            if (player.uid === useruid) return false;
    }

    return true;
}

function DoesUserOwnLobby(useruid)
{
    for (const lobby in Lobbies)
        if (Lobbies[lobby].owneruid === useruid) return true;
    return false;
}

function IsUserInLobby(useruid)
{
    // Doesn't matter if they own the lobby, if they do, they're
    // included in the player list
    // TODO: potential bug, if user has created but not joined their lobby
    for (const lobby in Lobbies)
    {
        // if user is in any lobbies already
        for (const player of Lobbies[lobby].players)
            if (player.uid === useruid) return true;
        // if user is spectating any lobbies already
        for (const player of Lobbies[lobby].spectators)
            if (player.uid === useruid) return true;
    }

    return false;
}

function IsLobbyReady(lobbyuid)
{
    if (!Lobbies[lobbyuid]) return false;
    if (!Lobbies[lobbyuid].players.length <= 1) return false;

    const arePlayersReady = Lobbies[lobbyuid].players.every(e => e.ready)



}



function GetLobbyByUID(lobbyuid)
{
    return Lobbies[lobbyuid];
}

function GetLobbyByOwnerUID(owneruid)
{
    for (const lobby in Lobbies)
        if (Lobbies[lobby].owneruid === owneruid) return Lobbies[lobby];
    return false;
}

function GetLobbyByUserUID(playeruid)
{
    for (const lobby in Lobbies)
    {
        for (const player of Lobbies[lobby].players)
            if (player.uid === playeruid) return Lobbies[lobby];
        for (const player of Lobbies[lobby].spectators)
            if (player.uid === playeruid) return Lobbies[lobby];
    }

    return false;
}

function GetPublicLobbies()
{

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

    Logger.game(`LOBBY ${uid} REGISTERED BY USER ${owneruid} (${Registrar.GetUserByUID(owneruid).username})`);
    return Lobbies[uid];
}

function DeRegisterLobby(useruid, lobbyuid, callback)
{
    callback(Registrar.GetUserByUID(useruid), Lobbies[lobbyuid], 'lobby-deregister');
    delete Lobbies[lobbyuid];
    Logger.game(`LOBBY ${lobbyuid} DEREGISTERED`);
}


function UserJoinLobby(lobbyuid, useruid, callback)
{
    if (IsUserInLobby(useruid)) return false;
    if (!Lobbies[lobbyuid]) return false;
    if (!Registrar.GetUserByUID(useruid)) return false;

    // TODO: check users and change lobby status

    const user = Registrar.GetUserByUID(useruid);
    Lobbies[lobbyuid].players.push({uid: useruid, name: user.username, ready: false});

    Logger.game(`LOBBY ${lobbyuid} USER ${useruid} (${user.username}) JOINING`);

    callback(user, Lobbies[lobbyuid], 'lobby-join');

    return GetLobbyByUID(lobbyuid);
}

function UserReady(useruid, callback)
{
    if (!IsUserInLobby(useruid)) return false;

    const lobbyuid = GetLobbyByUserUID(useruid).uid;
    Lobbies[lobbyuid].players[useruid].ready = true;

    callback(GetUserByUID(useruid), GetLobbyByUserUID(useruid), 'user-ready');
    return true;
}

function UserUnReady(useruid, callback)
{
    if (!IsUserInLobby(useruid)) return false;

    const lobbyuid = GetLobbyByUserUID(useruid).uid;
    Lobbies[lobbyuid].players[useruid].ready = false;

    callback(GetUserByUID(useruid), GetLobbyByUserUID(useruid), 'user-unready');
    return true;
}

// works for spectators too
function UserLeaveLobby(useruid, callback)
{
    if (!IsUserInLobby(useruid)) return false;
   
    // If user owns lobby, delete it
    if (DoesUserOwnLobby(useruid))
    {
        const lobby = GetLobbyByOwnerUID(useruid);
        Logger.game(`LOBBY ${lobby.uid} OWNER ${useruid} (${Registrar.GetUserByUID(useruid).username}) LEAVING`);
        DeRegisterLobby(useruid, lobby.uid, callback);
        return true;
    }

    const lobby = GetLobbyByUserUID(useruid);

    for (const player in Lobbies[lobby.uid].players)
        if (Lobbies[lobby.uid].players[player].uid === useruid)
            delete Lobbies[lobby.uid].players[player];

    for (const spectator in Lobbies[lobby.uid].spectators)
        if (Lobbies[lobby.uid].spectators[player].uid === useruid)
            delete Lobbies[lobby.uid].spectators[spectator];

    // clean "empty" array elements
    // for some reason JS leaves deleted elements in a non-single-type
    // array "empty-type", a new filtered array is required to not error
    Lobbies[lobby.uid].players = Lobbies[lobby.uid].players.filter(x => x);
    Lobbies[lobby.uid].spectators = Lobbies[lobby.uid].spectators.filter(x => x);

    callback(Registrar.GetUserByUID(useruid), lobby, 'lobby-leave');

    return true;
}

function SpectatorJoinLobby(lobbyuid, useruid, callback)
{

}


module.exports = {
    // Lobby validation exports
    CheckUserAvailability: CheckUserAvailability,
    DoesUserOwnLobby: DoesUserOwnLobby,
    IsUserInLobby: IsUserInLobby,
    IsLobbyReady: IsLobbyReady,

    // Get lobby exports
    GetLobbyByUID: GetLobbyByUID,
    GetLobbyByOwnerUID: GetLobbyByOwnerUID,
    GetLobbyByUserUID: GetLobbyByUserUID,
    GetPublicLobbies: GetPublicLobbies,

    // Change lobby state exports
    RegisterLobby: RegisterLobby,
    DeRegisterLobby: DeRegisterLobby,
    UserJoinLobby: UserJoinLobby,
    UserReady: UserReady,
    UserUnReady: UserUnReady,
    UserLeaveLobby: UserLeaveLobby,
    SpectatorJoinLobby: SpectatorJoinLobby
}

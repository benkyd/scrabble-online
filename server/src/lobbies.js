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
    - Lobby UID is "join code", will be much shorter than useruid
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
        for (const player of Lobbies[lobby].players)
            if (player.uid === useruid) return false;
        // if user is spectating any lobbies already
        for (const player of Lobbies[lobby].spectators)
            if (player.uid === useruid) return false;
    }

    return true;
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

function DoesUserOwnLobby(useruid)
{
    for (const lobby in Lobbies)
        if (Lobbies[lobby].owneruid === useruid) return true;
        
    return false;
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

function DeRegisterLobby(lobbyuid)
{
    delete Lobbies[lobbyuid];
    Logger.game(`LOBBY ${lobbyuid} DEREGISTERED`);
}

function UserJoinLobby(lobbyuid, useruid)
{
    if (IsUserInLobby(useruid)) return false;
    if (!Lobbies[lobbyuid]) return false;
    if (!Registrar.GetUserByUID(useruid)) return false;

    // check users and change lobby status

    const user = Registrar.GetUserByUID(useruid);
    Lobbies[lobbyuid].players.push({uid: useruid, name: user.username});

    Logger.game(`LOBBY ${lobbyuid} USER ${useruid} (${user.username}) JOINING`);

    return GetLobbyByUID(lobbyuid);
}

// works for spectators too
function UserLeaveLobby(useruid)
{
    if (!IsUserInLobby(useruid)) return false;
   
    // If user owns lobby, delete it
    if (DoesUserOwnLobby(useruid))
    {
        const lobby = GetLobbyByOwnerUID(useruid);
        Logger.game(`LOBBY ${lobby.uid} OWNER ${useruid} (${Registrar.GetUserByUID(useruid).username}) LEAVING`);
        DeRegisterLobby(lobby.uid);
        return true;
    }

    const lobby = GetLobbyByUserUID(useruid);

    console.log(Lobbies[lobby.uid]);
    delete Lobbies[lobby.uid].players[useruid];
    delete Lobbies[lobby.uid].spectators[useruid];
    console.log(Lobbies[lobby.uid]);

    return true;
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
    GetLobbyByOwnerUID: GetLobbyByOwnerUID,
    GetLobbyByUserUID: GetLobbyByUserUID,
    GetPublicLobbies: GetPublicLobbies,

    // Change lobby state exports
    // TODO: take callback for update client event
    RegisterLobby: RegisterLobby,
    DeRegisterLobby: DeRegisterLobby,
    UserJoinLobby: UserJoinLobby,
    UserLeaveLobby: UserLeaveLobby,
    SpectatorJoinLobby: SpectatorJoinLobby
}

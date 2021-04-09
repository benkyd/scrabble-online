const Logger = require('./logger.js');
const WebServer = require('./webserver.js');
const Game = require('./game.js');
const Error = require('./error.js');

let io = {};

/**
 * All socket communication follows a standard call/response & event
 * flow, subsiquent communication call event names will be layered
 * with '-', for example identify-error is sent AFTER identify IF error
 * 
 * Once in a game, the communiation will be less back and fourth and 
 * more event/response based
 * 
 * Again, networking code will be seperated from domain logic with sockets
 * 
 * Sockets will error with HTTP error codes because it's a pretty decent
 * standard for standard errors that may occur. Then general errors will
 * be 500 errors with a description
 * 
 * Clients connect to identify with an 'intent' to be placed in a game or to
 * be part of the lobbying system, the intent of the client defines what 
 * sort of communication they will be recieving
 */

function init()
{
    io = require('socket.io')(WebServer.Server);
    io.on('connection', (socket) => {
        Logger.info(`NEW SOCKET CIENT ID ${socket.id}`);
        // Pass socket onto router
        Router(socket);
    })

    Logger.info('SOCKET SERVER LISTENING');
}



async function Router(socket)
{
    // First, ask socket to identify it's self
    // everything else should be event / intent
    // based
    socket.emit('identify');


    socket.on('identify', args => ClientIdentify(socket, args));

    socket.on('lobby-create', args => LobbyCreate(socket, args));
    socket.on('lobby-join', args => LobbyJoin(socket, args));
    socket.on('lobby-leave', args => LobbyLeave(socket, args));
    
    socket.on('lobby-user-ready', args => LobbyUserReady(socket, args));
    socket.on('lobby-user-unready', args => LobbyUserUnReady(socket, args));
    socket.on('lobby-game-begin', args => LobbyGameBegin(socket, args));

    socket.on('disconnect', args => HandleDisconnect(socket, ...args));

}


function ClientIdentify(socket, args)
{
    const err = new Error;
    
    const user = Game.Registrar.GetUserByUID(args.userid);
    const intent = args.intent;

    if (!intent)
    {
        err.addError(400, 'Bad Request', 'error-bad-intent');
        socket.emit('identify-error', err.toError);
        return;
    }

    if (!user)
    {
        err.addError(400, 'Bad Request', 'error-unknown-uid');
        socket.emit('identify-error', err.toError);
        return;
    }

    // TODO: Sort out client intent 
        
    const status = Game.Registrar.UserConnect(user.uid, socket.id);

    if (status === true)
    {
        socket.emit('identify-success', {connected: true, user: user});
        return;
    } 
    else if (status === 'error-taken-user-connection')
    {
        err.addError(500, 'Internal Server Error', 'error-taken-user-connection');
        socket.emit('identify-error', err.toError);
        return;
    } else
    {
        err.addError(500, 'Internal Server Error', 'error-illegal-user');
        socket.emit('identify-error', err.toError);
        return;
    }
}

// if i use a database in the future i need to consider that the lobby
// name is not yet sanatised
function LobbyCreate(socket, args)
{
    const err = new Error;

    const useruid = args.user.uid;

    if (!useruid)
    {
        err.addError(400, 'Bad Request', 'Unknown uid');
        socket.emit('lobby-create-error', err.toError);
        return;
    }

    if (!args.lobbyName || args.lobbyPrivate === undefined || args.lobbySpectators === undefined)
    {
        err.addError(400, 'Bad Request', 'Lobby malformed');
        socket.emit('lobby-create-error', err.toError);
        return;
    }

    // Make sure user is who they say they are
    const user = Game.Registrar.GetUserbyConnection(socket.id);
    if (!user || user.uid != useruid)
    {
        err.addError(403, 'Forbidden', 'error-illegal-user');
        socket.emit('lobby-create-error', err.toError);
        return;
    }

    // Make sure user isn't already in a lobby or owns one
    if (!Game.Lobbies.CheckUserAvailability(useruid))
    {
        err.addError(400, 'Bad Request', 'error-taken-lobby-ownership');
        socket.emit('lobby-create-error', err.toError);
        return;
    }

    const lobby = Game.Lobbies.RegisterLobby(useruid, args.lobbyName, args.lobbyPrivate, args.lobbySpectators);

    if (!lobby)
    {
        err.addError(500, 'Internal Server Error', 'error-illegal-lobby');
        socket.emit('lobby-create-error', err.toError);
        return;
    }

    // Lobby created
    socket.emit('lobby-create-success', {created: true, lobby: lobby});

    const lobbyJoined = Game.Lobbies.UserJoinLobby(lobby.uid, useruid, LobbyUpdateCallback);
    if (!lobbyJoined)
    {
        err.addError(403, 'Forbidden', 'error-cannot-join-lobby');
        socket.emit('lobby-create-error', err.toError);
        return;
    }

    if (lobbyJoined.uid !== lobby.uid)
    {
        err.addError(500, 'Internal Server Error', 'error-illegal-lobby');
        socket.emit('lobby-create-error', err.toError);
        return;
    }
    
    socket.join(lobby.uid);
    socket.emit('lobby-join-success', lobby);
}

function LobbyJoin(socket, args)
{
    const err = new Error;

    const useruid = args.user.uid;

    if (!useruid)
    {
        err.addError(400, 'Bad Request', 'error-unknown-uid');
        socket.emit('lobby-join-error', err.toError);
        return;
    }

    if (!args.lobbyuid || args.joinAsSpectator === undefined)
    {
        err.addError(400, 'Bad Request', 'error-malformed-lobby');
        socket.emit('lobby-join-error', err.toError);
        return;
    }

    // Make sure user is who they say they are
    const user = Game.Registrar.GetUserbyConnection(socket.id);
    if (!user || user.uid != useruid)
    {
        err.addError(403, 'Forbidden', 'error-illegal-user');
        socket.emit('lobby-join-error', err.toError);
        return;
    }

    // Make sure user isn't already in a lobby
    if (!Game.Lobbies.CheckUserAvailability(useruid))
    {
        err.addError(400, 'Bad Request', 'error-taken-lobby-ownership');
        socket.emit('lobby-join-error', err.toError);
        return;
    }

    const lobby = Game.Lobbies.GetLobbyByUID(args.lobbyuid);
    if (!lobby)
    {
        err.addError(400, 'Bad Request', 'error-lobby-not-exist');
        socket.emit('lobby-join-error', err.toError);
        return;
    }

    if (args.joinAsSpectator)
    {
        // TODO
    } else 
    {
        const status = Game.Lobbies.UserJoinLobby(lobby.uid, useruid, LobbyUpdateCallback);
    
        if (!status)
        {
            err.addError(403, 'Forbidden', 'error-cannot-join-lobby');
            socket.emit('lobby-join-error', err.toError);
            return;
        }

        socket.join(lobby.uid);
        socket.emit('lobby-join-success', lobby);
    }
}

function LobbyLeave(socket, args)
{
    const user = Game.Registrar.GetUserbyConnection(socket.id);
    const lobby = Game.Lobbies.GetLobbyByUserUID(user.uid);
    Logger.debug(`USER ${user.uid} (${Game.Registrar.GetUserByUID(user.uid).username}) ATTEMPTING TO LEAVE LOBBY`);
    socket.leave(lobby.uid);
    Game.Lobbies.UserLeaveLobby(user.uid, LobbyUpdateCallback);
}

function LobbyUserReady(socket, args)
{
    const user = Game.Registrar.GetUserbyConnection(socket.id);
    if (!Game.Lobbies.UserReady(user.uid, LobbyUpdateCallback)) return;
    
    Logger.debug(`USER ${user.uid} (${Game.Registrar.GetUserByUID(user.uid).username}) READY`);
}

function LobbyUserUnReady(socket, args)
{
    const user = Game.Registrar.GetUserbyConnection(socket.id);
    
    if (!Game.Lobbies.UserUnReady(user.uid, LobbyUpdateCallback)) return;
    
    Logger.debug(`USER ${user.uid} (${Game.Registrar.GetUserByUID(user.uid).username}) UNREADY`);
}

function LobbyGameBegin(socket, args) 
{
    
}


function HandleDisconnect(socket, args)
{
    const user = Game.Registrar.GetUserbyConnection(socket.id);
    if (!user) return;
    
    // if user is in a lobby, leave and if user own's a lobby, destruct
    // leave lobby before user is disconnected
    LobbyLeave(socket);

    Game.Registrar.UserDisconnect(user.uid);
    
    Logger.info(`SOCKET ${socket.id} DISCONNECTED`);
}


/**
 * Possible states
 * 
 * lobby-deregister
 * lobby-join
 * user-ready
 * user-unready
 * lobby-leave 
 */
function LobbyUpdateCallback(user, lobby, state)
{
    // Just send updated lobby object for now
    io.to(lobby.uid).emit('lobby-update', {
        state: state, 
        updateuser: Game.Registrar.GetSafeUserByUID(user.uid), 
        lobby: lobby
    });
}

module.exports = {
    init: init
}

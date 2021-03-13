const Logger = require('./logger.js');
const WebServer = require('./webserver.js');
const Game = require('./game.js');
const Error = require('./error.js');

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
    const io = require('socket.io')(WebServer.Server);

    io.on('connection', (socket) => {
        Logger.info(`NEW SOCKET CIENT ID ${socket.id}`)
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


    socket.on('disconnect', args => HandleDisconnect(socket, ...args));

}


function ClientIdentify(socket, args)
{
    const err = new Error;
    
    const user = Game.Registrar.GetUserByUID(args.userid);
    const intent = args.intent;

    if (!intent)
    {
        err.addError(403, 'Forbidden', 'Client has no intent');
        socket.emit('identify-error', err.toError);
        return;
    }

    if (!user)
    {
        err.addError(403, 'Forbidden', 'Unknown uid');
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
    else if (status === 'User Already Connected')
    {
        err.addError(500, 'Internal Server Error', 'User already connected');
        socket.emit('identify-error', err.toError);
        return;
    } else
    {
        err.addError(500, 'Internal Server Error', 'Socket busy');
        socket.emit('identify-error', err.toError);
        return;
    }
}

function LobbyCreate(socket, args)
{
    console.log(args);
}

function LobbyJoin(socket, args)
{

}

function HandleDisconnect(socket, args)
{
    Logger.debug(`${socket.id} DISCONNECTED`);
    const user = Game.Registrar.GetUserbyConnection(socket.id);
    if (!user) return;
    Game.Registrar.UserDisconnect(user.uid);
}


module.exports = {
    init: init
}

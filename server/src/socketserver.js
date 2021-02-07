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
 * standard for standard errors that may occur
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


// 
let ActiveSockets = [];

async function Router(socket)
{
    // First, ask socket to identify it's self
    socket.emit('identify');


    socket.on('identify', user => ClientIdentify(socket, user.userid));


    socket.on('disconnect', args => HandleDisconnect(socket, ...args));

}


function ClientIdentify(socket, userid)
{
    const err = new Error;
    
    const user = Game.Registrar.GetUserByUID(userid);
    
    console.log(user);

    if (!user)
    {
        err.addError(403, 'Forbidden', 'Unknown uid');
        socket.emit('identify-error', err.toError);
        return;
    }



}

function HandleDisconnect(socket, args)
{

}


module.exports = {
    init: init
}

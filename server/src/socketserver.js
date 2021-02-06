const Logger = require('./logger.js');
const WebServer = require('./webserver.js');
const Game = require('./game.js');

/**
 * All socket communication follows a standard call/response & event
 * flow, subsiquent communication call event names will be layered
 * with '-', for example identify-error is sent AFTER identify IF error
 * 
 * Once in a game, the communiation will be less back and fourth and 
 * more event/response based
 * 
 * Again, networking code will be seperated from domain logic with sockets
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
    socket.on('connect', (...args) => {
        socket.emit('identify');
    })

    socket.on('identify', userid => ClientIdentify(socket, userid));


    socket.on('disconnect', args => HandleDisconnect(socket, ...args));

}


function ClientIdentify(socket, userid)
{
    const user = Game.Registrar.GetUserByUID(userid);
    
    if (!user)
    {
        
    }

}

function HandleDisconnect(socket, args)
{

}


module.exports = {
    init: init
}

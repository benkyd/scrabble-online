const Logger = require('./logger.js');
const WebServer = require('./webserver.js');

function init()
{
    const http = require('http').Server(WebServer.App);
    const io = require('socket.io')(http);

    io.on('connection', (socket) => {
        console.log(socket);
    })

    Logger.info('SOCKET SERVER LISTENING');
}


module.exports = {
    init: init
}

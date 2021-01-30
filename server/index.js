const Logger = require('./src/logger.js');
const Server = require('./src/webserver.js');
const Router = require('./src/router.js');
const Socket = require('./src/socketserver.js');

require('dotenv').config()

async function main()
{
    Logger.SetLevel(Logger.VERBOSE_LOGS);
    Logger.init();

    await Server.init();
    await Socket.init();
    await Router.init();

    // await Server.

    Logger.ready();
}

main();


const Logger = require('./logger.js');
const Server = require('./webserver.js');
const Router = require('./router.js')

require('dotenv').config()

async function main()
{
    Logger.SetLevel(Logger.VERBOSE_LOGS);
    Logger.init();

    await Server.init();
    await Router.init();

    // await Server.

    Logger.ready();
}

main();


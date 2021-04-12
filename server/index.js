const Logger = require('./src/logger.js');
const Server = require('./src/webserver.js');
const Router = require('./src/router.js');
const Socket = require('./src/socketserver.js');
const Locale = require('./src/locale.js');
const Dict = require('./src/dictionary.js');

require('dotenv').config();

async function main()
{
    Logger.SetLevel(Logger.VERBOSE_LOGS);
    Logger.init();

    await Locale.init();
    await Dict.LoadTextDictionaries();
    await Server.init();
    await Socket.init();
    await Router.init();


    Logger.ready();
}

main();


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

    // benchmarkDictionary();

    Logger.ready();
}

function benchmarkDictionary()
{
    let hrTime = process.hrtime();
    let startTime = hrTime[0] * 1000000 + hrTime[1] / 1000;

    // Time 10 thousand reads
    for (let i = 0; i < 10000; i++)
    {
        Dict.FindWord('en', 'ZZZS');
    }

    hrTime = process.hrtime();
    let endTime = hrTime[0] * 1000000 + hrTime[1] / 1000;

    Logger.debug(`10 000 Reads (unoptimised): ${endTime - startTime}μs`)


    Dict.Optimise();


    hrTime = process.hrtime();
    startTime = hrTime[0] * 1000000 + hrTime[1] / 1000;

    // Time 10 thousand reads
    for (let i = 0; i < 10000; i++)
    {
        Dict.FindWord('en', 'ZZZS');
    }

    hrTime = process.hrtime();
    endTime = hrTime[0] * 1000000 + hrTime[1] / 1000;

    Logger.debug(`10 000 Reads (optimised): ${endTime - startTime}μs`)
}



main();


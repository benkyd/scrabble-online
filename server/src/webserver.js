const Logger = require('./logger.js');

const Express = require('express');
const BodyParser = require('body-parser');
const Http = require('http');

async function init()
{
    // Yes all of these should be exported
    module.exports.Port = process.env.PORT || 8080;
    module.exports.App = Express();
    // must use HTTP server instead of express server so
    // that websockets can be hooked to the listen
    module.exports.Server = Http.Server(module.exports.App);

    module.exports.App.use(BodyParser.json());

    // Will throw if port is in use or if process
    // has no permission to listen on port x
    try
    {
        module.exports.Server.listen(module.exports.Port, () => {
            Logger.info(`WEB SERVER LISTENING ON ${module.exports.Port}`);
        },);
    } catch (e)
    {
        Logger.panic(`CANNOT LISTEN ON PORT ${module.exports.Port}: ${e}`);
    }
}


module.exports = {
    init: init
}

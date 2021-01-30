const Logger = require('./logger.js');

const Express = require('express');
const BodyParser = require('body-parser');

async function init()
{
    // Yes all of these should be exported
    module.exports.Port = process.env.SERVER_PORT || 8080;
    module.exports.App = Express();

    module.exports.App.use(BodyParser.json());

    // Will throw if port is in use or if process
    // has no permission to listen on port x
    try
    {
        module.exports.App.listen(module.exports.Port, () => {
            Logger.info(`WEBSERVER LISTENING ON ${module.exports.Port}`);
        },);
    } catch (e)
    {
        Logger.panic(`Cannot listen on port ${module.exports.Port}: ${e}`);
    }
}


module.exports = {
    init: init
}

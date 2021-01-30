const Logger = require('./logger.js');

const Express = require('express');
const BodyParser = require('body-parser');

module.exports.init = async function()
{
    module.exports.Port = process.env.SERVER_PORT || 8080;
    module.exports.App = Express();

    module.exports.App.use(BodyParser.json());

    module.exports.App.listen(module.exports.Port, () => {
        Logger.info(`WEBSERVER LISTENING ON ${module.exports.Port}`);
    });
}

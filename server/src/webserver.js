const Logger = require('./logger.js');

const Express = require('express');
const BodyParser = require('body-parser');

let App;
let Port;

async function init()
{
    // Yes all of these should be exported
    Port = process.env.SERVER_PORT || 8080;
    App = Express();

    App.use(BodyParser.json());

    // Will throw if port is in use or if process
    // has no permission to listen on port x
    try
    {
        App.listen(Port, () => {
            Logger.info(`WEB SERVER LISTENING ON ${Port}`);
        },);
    } catch (e)
    {
        Logger.panic(`CANNOT LISTEN ON PORT ${Port}: ${e}`);
    }
}


module.exports = {
    App: App,
    Port: Port,

    init: init
}

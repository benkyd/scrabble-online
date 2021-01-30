const Logger = require('./logger.js');
const Server = require('./webserver.js');
const Game = require('./game.js')

const Express = require('express');
const game = require('./game.js');

/**
 * Most domain logic is in this file, processing routes before
 * further processing from gamelogic or socket logic, not too
 * much point modularising this for a project of this fine scope
 */

async function init()
{
    Server.App.use(Express.static('../client/public'));

    Server.App.post('/login', HandleLogin);

    Logger.info('ROTUER SETUP');
}


module.exports = {
    init: init
}


/*
STANDARD ERROR RESPONSE
{
    errors: [
        {
            code: error code,
            error: "Short error",
            desc: "Description of the error"
        }   
    ]
}
*/
// Would automatically convert code to error
// but that would be too much effort and i cba
// TODO: That ^
class Error
{
    constructor()
    {
        this.errors = [];
    }

    addError(code, error, desc)
    {
        this.errors.push({code: code, error: error, desc: desc});
    }

    isErrored()
    {
        return this.errors.length >= 0;
    }

    end(expressRes)
    {
        expressRes.status(this.code).end(this.toString);
    }

    get toErrorObject()
    {
        return this.errors;
    }

    get toString()
    {
        return JSON.stringify(this.toErrorObject);
    }

    get code()
    {
        // Get the error code of the last error in the list
        // to return to the client if there is multiple
        return this.errors[this.errors.length - 1].code;
    }
}


/*
EXPECTS
{
    username: xxx
}
RESPONDS
{
    login:
    {
        success: true,
        userid: uid,
    }
    errors: []
}
*/
function HandleLogin(req, res, next)
{
    const err = new Error;

    if (!req.body.username)
    {
        err.addError(400, 'Bad Request', 'Username not present');
        err.end(res);
        return;
    }

    const username = req.body.username;

    if (!game.Registrar.CheckUsernameAvailability(username))
    {
        err.addError(403, 'Forbidden', 'Username taken');
        err.end(res);
        return;
    }

    game.Registrar.RegisterPlayer(username, req);

    res.end(JSON.stringify(req.body.username));

    // Continue to later middleware
    next();
}



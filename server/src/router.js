const Logger = require('./logger.js');
const Server = require('./webserver.js');
const Game = require('./game.js')

const Express = require('express');

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
        return JSON.stringify({errors: this.toErrorObject});
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
        user: {userobject},
    }
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

    if (!Game.Registrar.ValidUsername(username))
    {
        err.addError(403, 'Forbidden', 'Invalid username');
        err.end(res);
        return;
    }
    
    if (!Game.Registrar.CheckUsernameAvailability(username))
    {
        err.addError(403, 'Forbidden', 'Username taken');
        err.end(res);
        return;
    }

    // Check headers for proxied IP, incase server is in production on NGinx
    // 100000% going to forget about this when it comes to do the socket code
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Cheeky bit of spam protection, no 10 clients can come from the same
    // remote network
    if (Game.Registrar.CountIPs(ip) > 10)
    {
        err.addError(429, 'Too Many Requests', 'Too many clients');
        err.end(res);
        return;
    }

    const user = Game.Registrar.RegisterPlayer(username, ip);

    const response = {
        login: {
            success: true,
            user: user
        }
    }

    res.end(JSON.stringify(response));

    // Continue to later middleware
    next();
}



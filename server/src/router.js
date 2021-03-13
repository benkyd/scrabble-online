const Logger = require('./logger.js');
const Server = require('./webserver.js');
const Game = require('./game.js')
const Error = require('./error.js')

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
NOTES
    - userobject is defined in the game registrar
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

    const user = Game.Registrar.RegisterUser(username, ip);

    if (!user)
    {
        err.addError(500, 'Internal Server Error', 'User Connected');
        err.end(res);
        return;
    }

    const response = {
        login: {
            success: true,
            user: user
        }
    }

    Logger.info(`NEW USER ID ${user.uid}`);

    res.end(JSON.stringify(response));

    // Continue to later middleware
    next();
}

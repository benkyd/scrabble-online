const Logger = require('./logger.js');
const Server = require('./webserver.js');

const Express = require('express');

/**
 * Most buisness logic is in this file, processing routes before
 * further processing from gamelogic or socket logic, not too
 * much point modularising this for a project of this fine scope
 */

module.exports.init = async function()
{
    Server.App.use(Express.static('../client/public'));

    Server.App.post('/login', HandleLogin);

    Logger.info('ROTUER SETUP');
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
        res.status(err.code).end(err.toString);
        return;
    }

    res.end(JSON.stringify(req.body.username));
}

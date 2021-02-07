const Logger = require('./logger.js');

const Express = require('express');

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
module.exports = class Error
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

    get toError()
    {
        return this.errors;
    }

    get toString()
    {
        return JSON.stringify({errors: this.toError});
    }

    get code()
    {
        // Get the error code of the last error in the list
        // to return to the client if there is multiple
        return this.errors[this.errors.length - 1].code;
    }
}
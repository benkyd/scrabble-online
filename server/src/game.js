const Logger = require('./logger.js');
const Server = require('./server.js');

module.exports.OnlinePlayers = [];


function CheckUsernameAvailability(username)
{
    if (this.OnlinePlayers[username]) return false;
    return true;
}

function RegisterPlayer()
{
    
}


module.exports = {
    CheckUsernameAvailability: CheckUsernameAvailability,
    RegisterPlayer: RegisterPlayer
}

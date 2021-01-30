const Logger = require('./logger.js');
const Server = require('./webserver.js');

const Crypto = require("crypto");

/* 
USER OBJECT
{
    username: username,
    uid: id,
    ip: ip
}
*/
// TODO: Maybe stringify this for easy session persistence
// poor substitute for a proper database but it's better
// than nothing 
let OnlinePlayers = [];


// TODO: This won't scale very well lol
function CheckUsernameAvailability(username)
{
    for (const player in OnlinePlayers)
        if (OnlinePlayers[player].username == username)
            return false;
    return true;
}

function CountIPs(ip)
{
    let count = 0;
    for (const player in OnlinePlayers)
        if (OnlinePlayers[player].ip == ip)
            count++
    return count;
}

function RegisterPlayer(username, ip)
{
    // TODO: Don't assume this is unique, even with Crypto
    const id = Crypto.randomBytes(32).toString("hex");

    OnlinePlayers[id] = { 
        username: username,
        uid: id,
        ip: ip
    };

    console.log(`New player registering: ${username}, ${id}`);
    
    return OnlinePlayers[id];
}


module.exports = {
    OnlinePlayers: OnlinePlayers,

    CheckUsernameAvailability: CheckUsernameAvailability,
    CountIPs: CountIPs,
    RegisterPlayer: RegisterPlayer
}

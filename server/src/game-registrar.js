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
let OnlineUsers = [];


// TODO: This won't scale very well lol
function CheckUsernameAvailability(username)
{
    for (const player in OnlineUsers)
        if (OnlineUsers[player].username == username)
            return false;
    return true;
}

function CheckValidUID(uid)
{
    return (OnlineUsers[uid]) ? true : false;
}

function CountIPs(ip)
{
    let count = 0;
    for (const player in OnlineUsers)
        if (OnlineUsers[player].ip == ip)
            count++
    return count;
}

function ValidUsername(username)
{
    if (username.match(/[^A-Za-z0-9_-]/)) {
        return false;
    }
    return true;
}

function RegisterUser(username, ip)
{
    // TODO: Don't assume this is unique, even with Crypto, UUIDv4?
    const id = Crypto.randomBytes(32).toString("hex");

    OnlineUsers[id] = { 
        username: username,
        uid: id,
        ip: ip
    };

    Logger.info(`${id}: REGISTERING`);
    
    return OnlineUsers[id];
}


module.exports = {
    OnlineUsers: OnlineUsers,

    CheckUsernameAvailability: CheckUsernameAvailability,
    CheckValidUID: CheckValidUID,
    CountIPs: CountIPs,
    ValidUsername: ValidUsername,
    RegisterUser: RegisterUser
}

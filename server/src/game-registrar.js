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
NOTES
    - Socket relations are handled by the socket server in order
      to seperate domain logic from game and networking logic
*/
// TODO: Maybe stringify this for easy session persistence
// poor substitute for a proper database but it's better
// than nothing 
let OnlineUsers = [];


// TODO: This won't scale very well lol
function CheckUsernameAvailability(username)
{
    for (const user in OnlineUsers)
        if (OnlineUsers[user].username == username)
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
    for (const user in OnlineUsers)
        if (OnlineUsers[user].ip == ip)
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

function GetUserByUID(uid)
{
    return OnlineUsers[uid];
}

function GetUserByUsername(username)
{
    for (const user in OnlineUsers)
        if (OnlineUsers[user].username == username)
            return OnlineUsers[user];
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

function UserConnect()
{

}

function UserDisconnect()
{

}


module.exports = {
    OnlineUsers: OnlineUsers,

    CheckUsernameAvailability: CheckUsernameAvailability,
    CheckValidUID: CheckValidUID,
    CountIPs: CountIPs,

    GetUserByUID: GetUserByUID,
    GetUserByUsername: GetUserByUsername,
    
    ValidUsername: ValidUsername,
    
    RegisterUser: RegisterUser
}

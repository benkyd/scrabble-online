const Logger = require('./logger.js');
const Server = require('./webserver.js');

const Crypto = require("crypto");

/* 
USER OBJECT
{
    username: username,
    uid: id,
    ip: ip,
    // REGISTERED, CONNECTED, DISCONNECTED, INGAME
    state: 'REGISTERED',
    // Doesn't update if state changes
    connectionid: 'none',
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
        if (OnlineUsers[user].ip === ip)
            count++
    return count;
}

function ValidUsername(username)
{
    if (username.match(/[^A-Za-z0-9_-]/)) 
    {
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
        if (OnlineUsers[user].username === username)
            return OnlineUsers[user];
    return false;
}


function RegisterUser(username, ip)
{
    // TODO: Don't assume this is unique, even with Crypto, UUIDv4?
    const uid = Crypto.randomBytes(32).toString("hex");

    OnlineUsers[uid] = { 
        username: username,
        uid: uid,
        ip: ip,
        // REGISTERED, CONNECTED, DISCONNECTED, INGAME
        state: 'REGISTERED',
        // Doesn't update if state changes
        connectionid: 'none',
    };

    Logger.info(`${uid} REGISTERING`);
    
    return OnlineUsers[uid];
}



function UserConnectionExists(userid)
{
    if (OnlineUsers[userid].state === 'CONNECTED') return true;

}

function GetUserbyConnection(connectionid)
{
    for (const user in OnlineUsers)
        if (OnlineUsers[user].connectionid === connectionid)
            return OnlineUsers[user];
    return false;
}

function UserConnect(userid, connectionid)
{
    if (OnlineUsers[userid].state === 'CONNECTED') return 'User Connected';


    return true;
}

function UserDisconnect(userid, connectionid)
{

}


module.exports = {
    OnlineUsers: OnlineUsers,

    CheckUsernameAvailability: CheckUsernameAvailability,
    CheckValidUID: CheckValidUID,
    CountIPs: CountIPs,
    ValidUsername: ValidUsername,

    GetUserByUID: GetUserByUID,
    GetUserByUsername: GetUserByUsername,
    
    RegisterUser: RegisterUser,


    UserConnectionExists: UserConnectionExists,
    
    GetUserbyConnection: GetUserbyConnection,

    UserConnect: UserConnect,
    UserDisconnect: UserDisconnect
}

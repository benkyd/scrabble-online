const Logger = require('./logger.js');
const Server = require('./webserver.js');

const Crypto = require("crypto");

/* 
USER OBJECT
{
    username: username,
    uid: uid,
    ip: ip,
    // REGISTERED, CONNECTED, DISCONNECTED
    state: 'REGISTERED',
    // LOBYING, GAME, UNDECIDED
    intent: 'LOBBYING',
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
    // un-reserve username if original owner has disconnected
    for (const user in OnlineUsers)
        if (OnlineUsers[user].username === username && OnlineUsers[user].state === 'DISCONNECTED')
            return true;

    for (const user in OnlineUsers)
        if (OnlineUsers[user].username === username)
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
    const uid = Crypto.randomBytes(8).toString("hex");

    // Free up disconnected users with likewise usernames
    for (const user in OnlineUsers)
    {
        if (OnlineUsers[user].username === username && OnlineUsers[user].state === 'DISCONNECTED')
        {
            DeRegisterUser(user);
        }
    }

    OnlineUsers[uid] = { 
        username: username,
        uid: uid,
        ip: ip,
        // REGISTERED, CONNECTED, DISCONNECTED, INGAME
        state: 'REGISTERED',
        // Doesn't update if state changes
        connectionid: 'none',
    };

    Logger.info(`${uid} REGISTERING WITH ${ip} AS ${username}`);
    
    return OnlineUsers[uid];
}

function DeRegisterUser(userid)
{
    delete OnlineUsers[userid];
}



function UserConnectionExists(userid)
{
    if (OnlineUsers[userid].state === 'CONNECTED') return true;
    if (OnlineUsers[userid].state === 'DISCONNECTED') return false;
}

function GetUserbyConnection(connectionid)
{
    for (const user in OnlineUsers)
        if (OnlineUsers[user].connectionid === connectionid && OnlineUsers[user].state === 'CONNECTED')
            return OnlineUsers[user];
    return false;
}

function UserConnect(useruid, connectionid)
{
    if (OnlineUsers[useruid].state === 'CONNECTED') return 'User Already Connected';

    OnlineUsers[useruid].connectionid = connectionid;
    OnlineUsers[useruid].state = 'CONNECTED';

    Logger.info(`SOCKET ${connectionid} IDENTIFIED AS ${useruid} (${OnlineUsers[useruid].username})`);

    return true;
}

function UserDisconnect(useruid)
{
    if (!OnlineUsers[useruid]) return false;
    if (OnlineUsers[useruid].state === 'DISCONNECTED') return false; // no change
    OnlineUsers[useruid].state = 'DISCONNECTED';
    return true;
}


module.exports = {
    // Global exports
    OnlineUsers: OnlineUsers,

    // User validation exports
    CheckUsernameAvailability: CheckUsernameAvailability,
    CheckValidUID: CheckValidUID,
    CountIPs: CountIPs,
    ValidUsername: ValidUsername,

    // Get user exports
    GetUserByUID: GetUserByUID,
    GetUserByUsername: GetUserByUsername,
    
    // Change user state exports
    RegisterUser: RegisterUser,
    DeRegisterUser: DeRegisterUser,


    // User connection validation exports
    UserConnectionExists: UserConnectionExists,
    
    // Get user connection exports
    GetUserbyConnection: GetUserbyConnection,

    // Change user connection state exports
    UserConnect: UserConnect,
    UserDisconnect: UserDisconnect
}

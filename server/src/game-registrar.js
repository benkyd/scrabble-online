const Logger = require('./logger.js');
const Server = require('./webserver.js');

const Crypto = require("crypto");

/* 
USER OBJECT
{
    username: username,
    uid: uid,
    ip: ip,
    // REGISTERED, CONNECTED, DISCONNECTED, INGAME
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

    Logger.info(`${uid} REGISTERING WITH ${ip}`);
    
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
        if (OnlineUsers[user].connectionid === connectionid)
            return OnlineUsers[user];
    return false;
}

function UserConnect(userid, connectionid)
{
    if (OnlineUsers[userid].state === 'CONNECTED') return 'User Already Connected';

    OnlineUsers[userid].connectionid = connectionid;
    OnlineUsers[userid].state = 'CONNECTED';

    Logger.info(`SOCKET ${connectionid} IDENTIFIED AS ${userid}`);

    return true;
}

function UserDisconnect(userid)
{
    if (!OnlineUsers[userid]) return false;
    if (OnlineUsers[userid].state === 'DISCONNECTED') return false; // no change
    OnlineUsers[userid].state = 'DISCONNECTED';
    return true;
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
    DeRegisterUser: DeRegisterUser,


    UserConnectionExists: UserConnectionExists,
    
    GetUserbyConnection: GetUserbyConnection,

    UserConnect: UserConnect,
    UserDisconnect: UserDisconnect
}

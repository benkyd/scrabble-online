const urlParser = new URLSearchParams(window.location.search);

const ConnectionState = document.querySelector('#connection-state');
const PieceDrawer = document.querySelector('#piece-drawer');

function initMultiplayer()
{
    // init socket
    const socket = io(window.location.host);
    
    socket.on('connect', (...args) => {
        console.log('Socket Connected');
        ConnectionState.innerHTML = `${localeString('status')}: Waiting for identify`;
    });
    
    socket.on('disconnect', (...args) => {
        console.log('Socket Disconnected');
        ConnectionState.innerHTML = `${localeString('status')}: ${localeString('status-disconnected')}`;
        onDisconnect();
    });


    socket.on('identify', (...args) => {
        ConnectionState.innerHTML = 'Identify recived'
    
        if (!sessionStorage.user)
        {
            socket.disconnect();
            ConnectionState.innerHTML = 'Identify cannot proceed, no user';
            document.location.href += '../';
            return;
        }
    
        let user = {};
        try
        {
            user = JSON.parse(sessionStorage.user);
        } catch (e)
        {
            socket.disconnect();
            ConnectionState.innerHTML = 'Identify cannot proceed, corrupted user';
            document.location.href += '../';
            return;
        }
    
        if (!user.uid)
        {
            socket.disconnect();
            ConnectionState.innerHTML = 'Identify cannot proceed, corrupted user';
            document.location.href += '../';
            return;
        }
    
        const lobbyUID = urlParser.get('uid')

        if (!lobbyUID)
        {
            socket.disconnect();
            ConnectionState.innerHTML = 'Identify cannot proceed, corrupted lobby';
            document.location.href += '../';
            return;
        }

        socket.emit('identify', { userid: user.uid, lobbyuid: lobbyUID, intent: 'GAME' });
        ConnectionState.innerHTML = 'Identify response';
    });
    
    
    socket.on('identify-success', (...args) => {
        console.log(args[0]);
        ConnectionState.innerHTML = localeString('status-connected-as') + ' ' + args[0].user.username;
        onConnect();
    });
    
    socket.on('identify-error', (...args) => {
        console.log(args[0]);
        ConnectionState.innerHTML = JSON.stringify(args[0]);
        onDisconnect();
    });
    
}    


function onConnect()
{
    PieceDrawer.innerHTML = '';
}

function onDisconnect()
{

}



// is game singleplayer?
let isSingleplayer = false;
if (urlParser.get('uid') === null)
{
    isSingleplayer = true;
}

if (isSingleplayer)
{
    ConnectionState.innerHTML = localeString('no-connection-singleplayer');
    alert('Singleplayer is not implemented yet! a practice board will be set up to demonstrate tech and tile stuff');
} else
{
    initMultiplayer();
}

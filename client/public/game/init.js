const ConnectionState = document.querySelector('#connection-state');

ConnectionState.innerHTML = localeString('connection-waiting');

const socket = io(window.location.host);

// do not to be locale-ised because they do not communicate information
// to the user and are technical in nature
socket.on('connect', (...args) => {
    console.log('Socket Connected');
    ConnectionState.innerHTML = 'Waiting for identify'
});

socket.on('disconnect', (...args) => {
    console.log('Socket Disconnected');
    ConnectionState.innerHTML = 'Disconnected'
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

    // If, for some reason, the user in sessionstorage was corrupted
    // TODO: Session storage error object to display on the login screen
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

    socket.emit('identify', { userid: user.uid, intent: 'LOBYING' });
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


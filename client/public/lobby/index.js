const ConnectionState = document.querySelector('#connection-state');


ConnectionState.innerHTML = 'Waiting for connection'

const socket = io(window.location.host);

socket.on('connect', (...args) => {
    console.log('Socket Connected');
    ConnectionState.innerHTML = 'Waiting for identify'
});

socket.on('identify', (...args) => {
    ConnectionState.innerHTML = 'Identify recived'

    if (!sessionStorage.user)
    {
        socket.emit('identify', { playerid: 'none' });
        ConnectionState.innerHTML = 'Identify cannot proceed';
        document.location.href = document.location.href + '../';
        return;
    }

    const user = JSON.parse(sessionStorage.user);

    // If, for some reason, the user in sessionstorage was corrupted
    if (!user.uid)
    {
        socket.emit('identify', { playerid: 'none' });
        ConnectionState.innerHTML = 'Identify cannot proceed';
        document.location.href = document.location.href + '../';
        return;
    }

    socket.emit('identify', { userid: user.uid });
    ConnectionState.innerHTML = 'Identify response';
});

socket.on('identify-success', (...args) => {
    console.log(args);
});

socket.on('identify-error', (...args) => {
    console.log(args);
    ConnectionState.innerHTML = JSON.stringify(args[0]);
});


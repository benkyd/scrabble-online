const ConnectionState = document.querySelector('#connection-state');


ConnectionState.innerHTML = 'Waiting for connection'

const socket = io(window.location.host);

ConnectionState.innerHTML = 'Waiting for identify'

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

    socket.emit('identify', { playerid: user.uid });
    ConnectionState.innerHTML = 'Identify response';
});

socket.on('identify-success', (...args) => {

});

socket.on('identify-error', (...args) => {

});


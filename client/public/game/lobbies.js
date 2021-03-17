const LobbiesBlock = document.querySelector('#lobbies');
const CreateLobbyBlock = document.querySelector('#lobby-create');
const JoinLobbyBlock = document.querySelector('#lobby-join');
const ActiveLobbyBlock = document.querySelector('#lobby-active')

function initLobbies()
{
    LobbiesBlock.style.display = 'block';
    showBack();
}

function showCreateLobby()
{
    LobbiesBlock.style.display = 'none';
    JoinLobbyBlock.style.display = 'none';
    CreateLobbyBlock.style.display = 'block';
    ActiveLobbyBlock.style.display = 'none';
}

function showJoinLobby()
{
    LobbiesBlock.style.display = 'none';
    CreateLobbyBlock.style.display = 'none';
    JoinLobbyBlock.style.display = 'block';
    ActiveLobbyBlock.style.display = 'none';
}

function showBack()
{
    CreateLobbyBlock.style.display = 'none';
    JoinLobbyBlock.style.display = 'none';
    LobbiesBlock.style.display = 'block';
    ActiveLobbyBlock.style.display = 'none';
}

function showActive()
{
    CreateLobbyBlock.style.display = 'none';
    JoinLobbyBlock.style.display = 'none';
    LobbiesBlock.style.display = 'none';
    ActiveLobbyBlock.style.display = 'block';
}

function drawLobby(lobby)
{
    const lobbyDiv = document.createElement('div');
    ActiveLobbyBlock.innerHTML = "";
    lobbyDiv.id = lobby.id;

    // TODO: Make drawlobby function
    lobbyDiv.innerHTML += `<h2>Lobby ${lobby.name}</h2><p><h3>Join Code: <b>${lobby.uid}</b></h3><p>Players:`;
    
    for (const player of lobby.players)
        lobbyDiv.innerHTML += `<b>${player.name}</b>, `
    // remove trailing comma
    lobbyDiv.innerHTML = lobbyDiv.innerHTML.slice(0, -2);

    if (lobby.allowspectators)
    {
        lobbyDiv.innerHTML += '<p>Spectators:';
        for (const player of lobby.spectators)
            lobbyDiv.innerHTML += `<b>${player.name}</b>, `
        lobbyDiv.innerHTML = lobbyDiv.innerHTML.slice(0, -2);
    }

    lobbyDiv.innerHTML += `<p>Visibility: ${lobby.visibility}<p>State: ${lobby.state}`

    lobbyDiv.innerHTML += '<input type="button" value="Start Game" onclick="" disabled>'
    lobbyDiv.innerHTML += '<input type="button" value="Leave Lobby" onclick="leaveLobby()">'

    ActiveLobbyBlock.appendChild(lobbyDiv);
}



function createLobby()
{
    const lobbyName = document.querySelector('#lobby-input-name').value;
    const lobbyPrivate = document.querySelector('#lobby-input-private').checked;
    const lobbySpectators = document.querySelector('#lobby-input-spectators').checked;

    if (lobbyName === '')
    {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'lobby-error';
        errorDiv.innerHTML = 'ERROR: LobbyName is required';
        errorDiv.classList.add('red');
        CreateLobbyBlock.appendChild(errorDiv);
        return;
    }

    let user = {};
    try
    {
        user = JSON.parse(sessionStorage.user);
    } catch (e)
    {
        socket.disconnect();
        ConnectionState.innerHTML = 'Corrupted user';
        document.location.href = document.location.href + '../';
        return;
    }

    socket.emit('lobby-create', {
        user: {
            uid: user.uid
        },        
        lobbyName: lobbyName,
        lobbyPrivate: lobbyPrivate,
        lobbySpectators: lobbySpectators
    });

    if (document.querySelector('#lobby-error'))
        document.querySelector('#lobby-error').remove();
}

socket.on('lobby-create-success', lobby => {
    if (document.querySelector('#lobby-success'))
        document.querySelector('#lobby-success').innerHTML = "";

    const successDiv = document.createElement('div');
    successDiv.id = 'lobby-success';
    successDiv.innerHTML = 'SUCCESS: Lobby created, Joining...';
    CreateLobbyBlock.appendChild(successDiv);
});

socket.on('lobby-create-error', obj => {
    if (document.querySelector('#lobby-error'))
        document.querySelector('#lobby-error').innerHTML = "";

    const errorDiv = document.createElement('div');
    errorDiv.id = 'lobby-error';
    errorDiv.innerHTML = 'ERROR: An error occured while creating the lobby' + JSON.stringify(args);
    errorDiv.classList.add('red');
    CreateLobbyBlock.appendChild(errorDiv);
});


function joinLobby()
{
    const lobbyID = document.querySelector('#lobby-input-join-id').value;
    const joinAsSpectator = document.querySelector('#lobby-input-join-spectator').checked;

    if (lobbyID === '')
    {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'lobby-error';
        errorDiv.innerHTML = 'ERROR: A Lobby ID is required';
        errorDiv.classList.add('red');
        JoinLobbyBlock.appendChild(errorDiv);
        return;
    }

    let user = {};
    try
    {
        user = JSON.parse(sessionStorage.user);
    } catch (e)
    {
        socket.disconnect();
        ConnectionState.innerHTML = 'Corrupted user';
        document.location.href = document.location.href + '../';
        return;
    }

    socket.emit('lobby-join', {
        user: {
            uid: user.uid
        },
        lobbyID: lobbyID,
        joinAsSpectator: joinAsSpectator
    });

    if (document.querySelector('#lobby-error'))
        document.querySelector('#lobby-error').remove();
}

socket.on('lobby-join-success', lobby => {
    showActive();
    drawLobby(lobby);
});

socket.on('lobby-join-error', obj => {
    if (document.querySelector('#lobby-error'))
        document.querySelector('#lobby-error').innerHTML = "";
        
    const errorDiv = document.createElement('div');
    errorDiv.id = 'lobby-error';
    errorDiv.innerHTML = 'ERROR: An error occured while joining the lobby ' + JSON.stringify(args);
    errorDiv.classList.add('red');
    JoinLobbyBlock.appendChild(errorDiv);
});


socket.on('lobby-update', obj => {
    if (!obj) return;
    if (!obj.state) return;
    if (!obj.updateuser) return;
    if (!obj.lobby) return;

    drawLobby(obj.lobby);
});


function leaveLobby()
{
    // TODO: error check
    socket.emit('lobby-leave');
    showBack();
}

function destructLobbies()
{
    LobbiesBlock.style.display = 'none';
    CreateLobbyBlock.style.display = 'none';
    JoinLobbyBlock.style.display = 'none';
    ActiveLobbyBlock.style.display = 'none';
}

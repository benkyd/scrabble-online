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
    showActive();
    const lobbyDiv = document.createElement('div');
    lobbyDiv.id = lobby.id;

    // TODO: Make drawlobby function
    lobbyDiv.innerHTML += `<h2>Lobby ${lobby.name}</h2><p><h3>Join Code: <b>${lobby.uid}</b></h3><p>Players:`;
    
    for (const player of lobby.players)
        lobbyDiv.innerHTML += player.name + ' ';

    if (lobby.allowspectators)
    {
        lobbyDiv.innerHTML += '<p>Spectators:';
        for (const player of lobby.spectators)
            lobbyDiv.innerHTML += player.name + ' '; 
    }

    lobbyDiv.innerHTML += `<p>Visibility: ${lobby.visibility}<p>State: ${lobby.state}`

    lobbyDiv.innerHTML += '<input type="button" value="Start Game" onclick="" disabled>'
    lobbyDiv.innerHTML += '<input type="button" value="Leave Lobby" onclick="destructLobbies()">'

    ActiveLobbyBlock.appendChild(lobbyDiv);
});

socket.on('lobby-create-error', (...args) => {
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

socket.on('lobby-join-success', (...args) => {

});

socket.on('lobby-join-error', (...args) => {

});


socket.on('lobby-update');


function leaveLobby()
{
    // TODO: if in lobby AND owner of lobby
    socket.emit('lobby-destroy');

    // TODO: if in lobby
    socket.emit('lobby-leave');

}

function destructLobbies()
{
    LobbiesBlock.style.display = 'none';
    CreateLobbyBlock.style.display = 'none';
    JoinLobbyBlock.style.display = 'none';
    ActiveLobbyBlock.style.display = 'none';
}

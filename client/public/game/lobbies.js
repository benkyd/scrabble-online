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

// TODO: Lobbylist & buttons

function drawLobby(lobby)
{
    const lobbyDiv = document.createElement('div');
    ActiveLobbyBlock.innerHTML = "";
    lobbyDiv.id = lobby.uid;
    ActiveLobbyBlock.appendChild(lobbyDiv);

    lobbyDiv.innerHTML += `<h2>${localeString('lobby')} ${lobby.name}</h2><p><h3>${localeString('lobby-join-code')}: <b>${lobby.uid}</b></h3><p>${localeString('players')}:`;

    const lobbyPlayersDiv = document.createElement('div');
    lobbyPlayersDiv.id = 'lobby-players';
    for (const player of lobby.players)
        lobbyPlayersDiv.innerHTML += `<b>${player.name}</b>, `;
    // remove trailing comma
    lobbyPlayersDiv.innerHTML = lobbyPlayersDiv.innerHTML.slice(0, -2);
    lobbyDiv.appendChild(lobbyPlayersDiv);

    if (lobby.allowspectators && lobby.spectators.length !== 0)
    {
        const lobbySpectatorsDiv = document.createElement('div');
        lobbySpectatorsDiv.id = 'lobby-spectators';
        lobbySpectatorsDiv.innerHTML += `<p>${localeString('spectators')}:`;
        for (const player of lobby.spectators)
            lobbySpectatorsDiv.innerHTML += `<b>${player.name}</b>, `;
        lobbySpectatorsDiv.innerHTML = lobbySpectatorsDiv.innerHTML.slice(0, -2);
        lobbyDiv.appendChild(lobbySpectatorsDiv);
    }

    lobbyDiv.innerHTML += `<p>${localeString('visibility')}: ${lobby.visibility}<p>${localeString('status')}: ${lobby.state}`;
    lobbyDiv.innerHTML += `<p><input type="checkbox" id="lobby-input-ready"> ${localeString('ready')}`;
    
    // TODO: only the owner of the lobby should be able to start the game
    lobbyDiv.innerHTML += `<input id="button-start-game" type="button" value="${localeString('button-start-game')}" onclick="startGame()" disabled>`;
    lobbyDiv.innerHTML += `<input type="button" value="${localeString('button-leave-lobby')}" onclick="leaveLobby()">`

    const checkbox = document.querySelector('#lobby-input-ready');
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) socket.emit('lobby-user-ready');
        else socket.emit('lobby-user-unready');
    });
}

// edits values instead of redrawing
// so as not to mess up the event listeners
function drawLobbyPartial(lobby)
{
    const lobbyPlayers = document.querySelector('#lobby-players');
    const lobbySpectators = document.querySelector('#lobby-spectators');

    lobbyPlayers.innerHTML = '';
    for (const player of lobby.players)
    lobbyPlayers.innerHTML += `<b>${player.name}</b>, `;
    lobbyPlayers.innerHTML = lobbyPlayers.innerHTML.slice(0, -2);

    if (!lobbySpectators) return;

    if (lobby.spectators.length === 0) return;
    for (const player of lobby.spectators)
        lobbySpectators.innerHTML += `<b>${player.name}</b>, `;
    lobbySpectators.innerHTML = lobbySpectators.innerHTML.slice(0, -2);
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
        errorDiv.innerHTML = localeString('error-bold') + localeString('error-lobby-name-required');
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

socket.on('lobby-create-success', obj => {
    if (document.querySelector('#lobby-success'))
        document.querySelector('#lobby-success').innerHTML = "";

    pageLog(`${localeString('lobby-created')} ${obj.lobby.uid} (${(obj.lobby.name)})`);
});

socket.on('lobby-create-error', obj => {
    if (document.querySelector('#lobby-error'))
        document.querySelector('#lobby-error').innerHTML = "";

    const errorDiv = document.createElement('div');
    errorDiv.id = 'lobby-error';
    errorDiv.innerHTML = localeString('error-bold') + localeString('error-creating-lobby') + ' ' + JSON.stringify(args);
    errorDiv.classList.add('red');
    CreateLobbyBlock.appendChild(errorDiv);
    pageLog(localeString('error-bold') + localeString('error-creating-lobby') + ' ' + JSON.stringify(args));
});


function joinLobby()
{
    const lobbyuid = document.querySelector('#lobby-input-join-id').value;
    const joinAsSpectator = document.querySelector('#lobby-input-join-spectator').checked;

    if (lobbyuid === '')
    {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'lobby-error';
        errorDiv.innerHTML = localeString('error-bold') + localeString('error-lobby-id-required');
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
        lobbyuid: lobbyuid,
        joinAsSpectator: joinAsSpectator
    });

    if (document.querySelector('#lobby-error'))
        document.querySelector('#lobby-error').remove();

    pageLog(`${localeString('lobby-joining')} ${lobbyuid}`);

}

socket.on('lobby-join-success', lobby => {
    showActive();
    drawLobby(lobby);
    pageLog(`${localeString('lobby-joined')} ${lobby.uid} (${(lobby.name)})`);
});

socket.on('lobby-join-error', obj => {
    if (document.querySelector('#lobby-error'))
        document.querySelector('#lobby-error').innerHTML = "";
        
    const errorDiv = document.createElement('div');
    errorDiv.id = 'lobby-error';
    errorDiv.innerHTML = localeString('error-bold') + localeString('error-lobby-joining') + ' ' + JSON.stringify(obj);
    errorDiv.classList.add('red');
    JoinLobbyBlock.appendChild(errorDiv);
    pageLog(localeString('error-bold') + localeString('error-lobby-joining') + ' ' + JSON.stringify(obj));
});


function startGame()
{

    // transition user intent
    // call start game
    // transition all other clients intent
    // redirect with timeout

}


socket.on('lobby-update', obj => {
    if (!obj) return;
    if (!obj.state) return;
    if (!obj.updateuser) return;
    if (!obj.lobby) return;

    drawLobbyPartial(obj.lobby);

    console.log(obj);

    // TODO: use a switch lol
    if (obj.state === 'lobby-join')
        pageLog(`${obj.updateuser.username} ${localeString('joined')}`);

    if (obj.state ==='lobby-leave')
        pageLog(`${obj.updateuser.username} ${localeString('left')}`);

    if (obj.state === 'lobby-deregister')
    {
        pageLog(`${obj.updateuser.username} ${localeString('lobby-deleted')}`);
        leaveLobby();
    }

    if (obj.state === 'user-ready')
        pageLog(`${obj.updateuser.username} ${localeString('user-is-ready')}`);

    if (obj.state === 'user-unready')
        pageLog(`${obj.updateuser.username} ${localeString('user-is-unready')}`);


    if (obj.state === 'game-ready')
        document.querySelector('#button-start-game').disabled = false;

    if (obj.state === 'game-unready')
        document.querySelector('#button-start-game').disabled = true;
    

});

function leaveLobby()
{
    // TODO: error check
    socket.emit('lobby-leave');
    pageLog(localeString('left-lobby'));
    showBack();
}

function destructLobbies()
{
    LobbiesBlock.style.display = 'none';
    CreateLobbyBlock.style.display = 'none';
    JoinLobbyBlock.style.display = 'none';
    ActiveLobbyBlock.style.display = 'none';
}




socket.on('game-ready', () =>
{

});





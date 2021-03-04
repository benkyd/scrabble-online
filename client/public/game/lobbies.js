const LobbiesBlock = document.querySelector('#lobbies');
const CreateLobbyBlock = document.querySelector('#lobby-create');
const JoinLobbyBlock = document.querySelector('#lobby-join');


function createLobby()
{
    LobbiesBlock.style.display = 'none';
    JoinLobbyBlock.style.display = 'none';
    CreateLobbyBlock.style.display = 'block';
    
}

function joinLobby()
{
    LobbiesBlock.style.display = 'none';
    CreateLobbyBlock.style.display = 'none';
    JoinLobbyBlock.style.display = 'block';
}

function back()
{
    CreateLobbyBlock.style.display = 'none';
    JoinLobbyBlock.style.display = 'none';
    LobbiesBlock.style.display = 'block';
}


function initLobbies()
{
    LobbiesBlock.style.display = 'block';

}

function destructLobbies()
{
    LobbiesBlock.style.display = 'none';
    CreateLobbyBlock.style.display = 'none';
    JoinLobbyBlock.style.display = 'none';
}

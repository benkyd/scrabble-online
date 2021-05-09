// DOES NOT DEAL WITH GAME BOARD

// chat
const ChatBox = document.querySelector('#game-chat');
const ChatMessageBox = document.querySelector('#game-chat-input');
const ChatMessageSubmit = document.querySelector('#game-chat-button');

// players
const IPlayerScores = document.querySelectorAll('.player-scores');

// playlog
const PlayLog = document.querySelector('#moves');

function initUI()
{
    IPlayerScores.forEach(e => {
        e.innerHTML = '';
    });
    PlayLog.innerHTML = '';
    ChatBox.value = '';
}

const UserUIReplacer = (p, n, s) => `<div class="p${p} player">
<div class="p${0}-name player-name">${n}</div>
Score:<div class="p${p}-score player-score">${s}</div>
</div>`;

// expects initUI called before
function setupUsersUI(users, turn)
{
    let elements = [];
    for (const user in users)
    {
        elements.push(UserUIReplacer(user, users[user].name, users[user].score));
    }
    IPlayerScores.forEach(e => {
        e.innerHTML += elements.join('');
    });

    document.querySelectorAll(`.p${turn}`).forEach(e => {
        e.classList.toggle('theirturn');
    });
}

function updateUsersUI(users, turn)
{

}


function onExchangeTiles()
{
    let tiles = prompt('Enter the tiles you would like to exchange seperated by commas (this will use your turn)')
    tiles = tiles.split(',');
    console.log(tiles);
    
}

function onSkipTurn()
{

}

function onPlayTurn()
{

}

function onMessageSend()
{

}

function onTurnProcess()
{

}

function onTurnPlay(oldturnuser, newturnuser, newboardstate)
{

}

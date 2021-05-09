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

const UserUIReplacer = (p, u, n, s) => `<div class="p${p} player${u} player">
<div class="p${0}-name player-name">${n}</div>
Score:<div class="p${p}-score player-score">${s}</div>
</div>`;

// expects initUI called before
function setupUsersUI(users, turn)
{
    let elements = [];
    for (const user in users)
    {
        elements.push(UserUIReplacer(user, users[user].uid, users[user].name, users[user].score));
    }
    IPlayerScores.forEach(e => {
        e.innerHTML += elements.join('');
    });

    console.log(users[turn].uid, JSON.parse(sessionStorage.getItem('user')).uid)

    updateUsersUI();
}

// takes users object from 
function updateUsersUI(users)
{
    for (const user of Users)
    {
        if (user.turn && user.me)
        {
            document.querySelectorAll(`.player${user.uid}`).forEach(e => {
                e.classList.add('myturn');
            });
        } else if (user.turn)
        {
            document.querySelectorAll(`.player${user.uid}`).forEach(e => {
                e.classList.add('theirturn');
            });
        } else 
        {
            document.querySelectorAll(`.player${user.uid}`).forEach(e => {
                if (e.classList.contains('myturn'))
                    e.classList.remove('myturn');
                if (e.classList.contains('myturnprocess'))
                    e.classList.remove('myturnprocess');
                if (e.classList.contains('theirturn'))
                    e.classList.remove('theirturn');
            });
        }
    }
}

function onExchangeTiles()
{
    let tiles = prompt('Enter the tiles you would like to exchange seperated by commas or type all for all of them (this will use your turn)')
    
    // no error, user escaped do not change state
    if (tiles === null)
        return;
    
    try {
        tiles = tiles.split(',');
        // remove null entries
        tiles = tiles.filter(x => x);
    } catch (e) {
        alert('Incorrect usage, remember tiles need to be split with a comma (,)');
        onExchangeTiles();
        return;
    }


    console.log(tiles);
}

function onSkipTurn()
{
    if(confirm('Are you sure you want to skip your turn?'))
    {
        skipMyTurn();
    }
}

function onPlayTurn()
{
    // get all staged pieces
    const stagedPieces = getAllStagedPieces();
    const status = playMyTurn(stagedPieces);

    if (!status)
    {
        alert('Invalid turn!')
    } else 
    {
        // switch state to processing
    }
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

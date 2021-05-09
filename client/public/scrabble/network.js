const urlParser = new URLSearchParams(window.location.search);

const ConnectionState = document.querySelectorAll('.connection-state');
const PieceDrawer = document.querySelector('#piece-drawer');

function initMultiplayer()
{
    // init socket
    const socket = io(window.location.host);
    
    socket.on('connect', args => {
        console.log('Socket Connected');
        ConnectionState.forEach(e => {
            e.innerHTML = `${localeString('status')}: Waiting for identify`;
        });
    });
    
    socket.on('disconnect', args => {
        console.log('Socket Disconnected');
        ConnectionState.forEach(e => {
            e.innerHTML = `${localeString('status')}: ${localeString('status-disconnected')}`;
        });
        onDisconnect();
    });

    socket.on('identify', args => onIdentify(socket, args));
    socket.on('identify-success', args => onIdentifySuccess(socket, args));
    socket.on('identify-error', args => onIdentifyError(socket, args));
    
    socket.on('game-begin', args => onGameBegin(socket, args));
    socket.on('game-your-turn', args => onStartTurn(socket, args)); // my turn
    socket.on('game-turn-start', args => onTurnStart(socket, args)); // others turn
    
    console.log('multiplayer ready');
}    



function onIdentify(socket, args)
{
    ConnectionState.forEach(e => {
        e.innerHTML = 'Identify recived'
    });

    if (!sessionStorage.user) 
    {
        socket.disconnect();
        ConnectionState.forEach(e => {
            e.innerHTML = 'Identify cannot proceed, no user';
        });        
        window.location = `/`;
        return;
    }

    let user = {};
    try
    {
        user = JSON.parse(sessionStorage.user);
    } catch (e)
    {
        socket.disconnect();
        ConnectionState.forEach(e => {
            e.innerHTML = 'Identify cannot proceed, corrupted user';
        });
        window.location = `/`;
        return;
    }

    if (!user.uid)
    {
        socket.disconnect();
        ConnectionState.forEach(e => {
            e.innerHTML = 'Identify cannot proceed, corrupted user';
        });
        window.location = `/`;
        return;
    }

    const lobbyUID = urlParser.get('uid');

    if (!lobbyUID)
    {
        socket.disconnect();
        ConnectionState.forEach(e => {
            e.innerHTML = 'Identify cannot proceed, corrupted lobby';
        });
        window.location = `/`;
        return;
    }

    socket.emit('identify', { userid: user.uid, lobbyuid: lobbyUID, intent: 'GAME' });
    ConnectionState.forEach(e => {
        e.innerHTML = 'Identify response';
    });
}

function onIdentifySuccess(socket, args)
{
    console.log(args);
    ConnectionState.forEach(e => {
        e.innerHTML = localeString('status-connected-as') + ' ' + args.user.username;
    });
    onConnect();
}

function onIdentifyError(socket, args)
{
    console.log(args);
    ConnectionState.forEach(e => {
        e.innerHTML = JSON.stringify(args);
    });
    onDisconnect();
}

// get ready for game begin packet
function onConnect()
{
    PieceDrawer.innerHTML = '';
    // TODO: Other drawing here
}

function onDisconnect()
{

}

/*
GAME OBJECT
{
    // Reference UID (of lobby)
    uid: uid,
    locale: en,
    players: [{
        uid: uid,
        name: username,
        activetiles: [tile: {
            letter: letter,
            score: int
        }],
        score: int
    }],
    // Index of players whos turn it is
    turn: int,
    // Array of GAMESTATEs, latest at head of array
    gamestates: [],
    tilebag: [],
    tileset: []
}
GAMESTATE OBJECT
{
    // UID of the player that played the turn
    playeruid: uid,
    turn: int,
    // SKIP, PLACE, EXCHANGE
    turntype: 'SKIP',
    // Generated after turn is processed
    outcome: {
        valid: bool,
        points: pointsgained,
        words: [{ 
            word: word,
            points: points,
            tiles: [{
                pos: {x: x, y: y},
                modifier: modifier,
                letter: letter,
                score: int
            }]
        }],
    }
    oldboardtiles: [{
        pos: {x: x, y: y},
        modifier: modifier,
        letter: letter,
        score: int
    }]
    boardtiles: [{
        pos: {x: x, y: y},
        modifier: modifier,
        letter: letter,
        score: int
    }]
}
*/
function onGameBegin(socket, args)
{
    if (!args)
    {
        ConnectionState.forEach(e => {
            e.innerHTML = localeString('error-game-begin');
        });
        return;
    }

    if (!args.game.uid)
    {
        ConnectionState.forEach(e => {
            e.innerHTML = localeString('error-game-begin');
        });
        return;
    }

    console.log(args);
    const boardstate = args.game.gamestates[args.game.gamestates.length-1];
    const tileset = args.tileset;
    const myplayer = args.gameuser;
    const players = args.game.players;

    if (!boardstate || !myplayer || !players || !tileset)
    {
        ConnectionState.forEach(e => {
            e.innerHTML = localeString('error-game-begin');
        });        
        return;
    }

    const status = initGame(boardstate, tileset, myplayer, players);

    if (!status)
    {
        ConnectionState.forEach(e => {
            e.innerHTML = localeString('error-game-begin');
        });
        return;
    }
}

function onStartTurn(socket, args)
{
    console.log('my turn');
    startMyTurn();
}

function onTurnStart(socket, args)
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
    ConnectionState.forEach(e => {
        e.innerHTML = localeString('no-connection-singleplayer');
    });
    alert('Singleplayer is not implemented yet! a practice board will be set up to demonstrate tech and tile stuff');
} else
{
    initMultiplayer();
}

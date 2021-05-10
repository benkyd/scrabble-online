const urlParser = new URLSearchParams(window.location.search);

const ConnectionState = document.querySelectorAll('.connection-state');
const PieceDrawer = document.querySelector('#piece-drawer');

// like a singleton in c++ or what have you
// but not
let socketinit = false;
let socket = {}; 
function getSocket()
{
    if (!socketinit)
    {
        socket = io(window.location.host);
        socketinit = true;
    }

    return socket;
}

function initMultiplayer()
{
    // init socket
    const socket = getSocket();
    
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
    socket.on('game-turn-error', args => onTurnError(socket, args)); // my turn had an error, game does not continue
    socket.on('game-turn-processed', args => onturnProcessed(socket, args)); // server returns turn (to all users)
    socket.on('game-turn-start', args => onTurnStart(socket, args)); // others turn
    
    socket.on('game-new-pieces', args => gameNewPieces(socket, args));
    
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
    removePiecesFromDrawer('*');
    addPiecesToDrawer([
        {letter: 'H', score: 1},
        {letter: 'E', score: 2},
        {letter: 'L', score: 3},
        {letter: 'L', score: 4},
        {letter: 'O', score: 5},
        {letter: 'O', score: 6},
        {letter: 'O', score: 7}
    ]);
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
    const boardstates = args.game.gamestates;
    const tileset = args.tileset;
    const myplayer = args.gameuser;
    const players = args.game.players;

    if (!boardstates || !myplayer || !players || !tileset)
    {
        ConnectionState.forEach(e => {
            e.innerHTML = localeString('error-game-begin');
        });
        return;
    }

    const status = initGame(boardstates, tileset, myplayer, players);

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
    console.log('It\'s my turn!');
    startMyTurn();
}

function netPlayTurn(turn)
{
    if (!isSingleplayer)
    {
        const socket = getSocket();
        socket.emit('game-play-turn', turn);
    }
}

function netSkipTurn()
{
    if (!isSingleplayer)
    {
        const socket = getSocket();
        socket.emit('game-skip-turn');
    }
}

function onTurnError(socket, args)
{
    console.log('error', args);
    if (args.error === 'error-game-word-not-exist')
    {
        alert(`${args.word} is not a word!`);
    } else
    {
        alert('Error in your turn: ' + args.error);
    }
    putPiecesBack();
}

function onturnProcessed(socket, args)
{
    processTurn(args.outcome);
}

function onTurnStart(socket, args)
{
    console.log('Turn Starting!');
    startOthersTurn(args.turninfo.turnplayer.uid);
}

function gameNewPieces(socket, args)
{
    console.log(args);
    newPieces(args.pieces)
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
    addPiecesToDrawer([
        {letter: 'H', score: 1},
        {letter: 'E', score: 2},
        {letter: 'L', score: 3},
        {letter: 'L', score: 4},
        {letter: 'O', score: 5},
        {letter: 'O', score: 6},
        {letter: 'O', score: 7}
    ]);
} else
{
    initMultiplayer();
}


function computeTurn()
{
    if (!isSingleplayer) return;
}


/*
GAMEUSERS OBJECT
{
    uid: uid,
    name: name,
    score: int,
    me: bool,
    turn: bool
}
NOTES
    - In play order
*/
let Users = [];
// just shorthand, so long as i remember to keep it updated lmao
let MyTurn = false;
let TileSet = [];

let pastTurns = [];

function initGame(boardstates, tileset, myplayer, players)
{
    pastTurns.push(...boardstates);

    TileSet = tileset;

    // construct piece array
    // structure [{letter: '', score: int}]
    let drawerStructure = [];
    for (const tile of myplayer.activetiles)
    {
        let points = 0;
        for (const pointband of tileset)
        {
            if (tile === '_')
            {
                points = '_';
                break;
            }
            if (pointband.letters.includes(tile))
            {
                points = pointband.points;
                break;
            }
        }

        const piece = {
            letter: tile,
            score: points
        }
        drawerStructure.push(piece);
    }
    addPiecesToDrawer(drawerStructure);

    // populate Users
    for (player of players)
    {
        Users.push({
            uid: player.uid,
            name: player.name,
            score: player.score,
            me: myplayer.uid === player.uid,
            turn: false
        });
    }
    Users[0].turn = true;
    if (Users[0].me)
        MyTurn = true;

    // construct UI
    initUI();
    setupUsersUI(Users, 0);

    return true;
}

function startMyTurn()
{
    MyTurn = true;
    for (const user in Users)
    {
        Users[user].turn = false;
        if (Users[user].me) Users[user].turn = true;
        else Users[user].turn = false;
    }
    updateUsersUI(Users);
    startMyTurnUI();
}

function startOthersTurn(useruid)
{
    MyTurn = false;
    for (const user in Users)
    {
        Users[user].turn = false;
        if (Users[user].uid === useruid) Users[user].turn = true;
        else Users[user].turn = false;
    }
    updateUsersUI(Users);
    stopMyTurnUI();
}

function playMyTurn(stagedpieces)
{
    if (!MyTurn) return false;

    // TODO: THE SERVER SHOULD NOTTTTTT TRUST THIS
    // but the it's 7pm on the sunday before the deadline

    // COPY NOT REF
    let oldboardtiles = Object.assign([], pastTurns[pastTurns.length-1].boardtiles);
    let boardtiles = Object.assign([], pastTurns[pastTurns.length-1].boardtiles);

    for (const piece of stagedpieces)
    {
        const pos = JSON.parse(piece.dataset.coords);
        boardtiles.push({
            pos: pos,
            modifier: BoardLocations[`${pos.x},${pos.y}`] || 'NONE',
            letter: piece.dataset.letter,
            // TBD (by the server)
            score: -1
        });
    }

    const turn = {  
        playeruid: Users.filter(e => e.me)[0].uid,
        // servers job
        turn: -1,
        turntype: 'PLACE',
        // servers job
        outcome: {},
        oldboardtiles: oldboardtiles,
        boardtiles: boardtiles
    }

    netPlayTurn(turn);
    
    return true;
}

function skipMyTurn()
{
    if (!MyTurn) return false;
    netSkipTurn();
}

function processTurn(turn)
{
    removeStagedPieces();
    renderBoardState(turn.boardtiles);

    /*
    OUTCOME OBJECT
    {
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
      */
    const outcome = turn.outcome;

    if (!outcome.valid) return;

    // GAMEUSERS OBJECT
    // {
    //     uid: uid,
    //     name: name,
    //     score: int,
    //     me: bool,
    //     turn: bool
    // }
    // NOTES

    let newpoints = 0;

    let lastuser = {};
    for (const user in Users)
    {
        if(Users[user].uid != turn.playeruid) continue;
        Users[user].score += turn.outcome.points;
        lastuser = Users[user];
    }

    changePlayerScore(lastuser.uid, lastuser.score);

    for (const word of turn.outcome.words)
    {
        addTurnDesc(word.word, lastuser.name, word.points);
    }
}

function newPieces(pieces)
{
    removePiecesFromDrawer('*');
    let drawerStructure = [];

    for (const tile of pieces)
    {
        let points = 0;
        for (const pointband of TileSet)
        {
            if (tile === '_')
            {
                points = '_';
                break;
            }
            if (pointband.letters.includes(tile))
            {
                points = pointband.points;
                break;
            }
        }

        const piece = {
            letter: tile,
            score: points
        }
        drawerStructure.push(piece);
    }
    addPiecesToDrawer(drawerStructure);
}


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

function initGame(boardstate, tileset, myplayer, players)
{
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

    console.log(Users, MyTurn);

    // construct UI
    initUI();
    setupUsersUI(Users, 0);


    return true;
}

function startMyTurn()
{

}

function startOthersTurn(useruid)
{

}

function playMyTurn(stagedpieces)
{
    if (!MyTurn) return false;

    return true;
}

function processOthersTurn()
{

}

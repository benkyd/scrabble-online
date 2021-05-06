
function computeTurn()
{
    if (!isSingleplayer) return;

    
}


function initGame(boardstate, tileset, myplayer, players)
{

    // construct piece array
    // structure [{letter: '', score: int}]
    let drawerStructure = [];
    for (const tile of myplayer.activetiles)
    {
        console.log(tile);
    }


    addPiecesToDrawer();
    return true;
}


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

        let points = 0;
        // for (const pointband of tileset)
        // {
        //     console.log(pointband)
        // }

        const piece = {
            letter: tile,
            score: points
        }
        drawerStructure.push(piece);
        console.log(tile);
    }


    addPiecesToDrawer(drawerStructure);
    return true;
}

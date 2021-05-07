
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
    
    
    
    return true;
}

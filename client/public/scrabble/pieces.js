
const BOARD_WIDTH = 600;
const BOARD_HEIGHT = 600;

// these change with resize
let BOARD_TL_X = document.querySelector('#game-container').getBoundingClientRect().left + window.scrollX;
let BOARD_TL_Y = document.querySelector('#game-container').getBoundingClientRect().top + window.scrollY;

const PIECE_WIDTH = 80;
const PIECE_HEIGHT = 80;

function piecePickedUp()
{

}

function piecePlaced()
{
    
}



function setupPieces() 
{
    // if the window has enough vertical height to fit the peices,
    // have them at the bottom of the board, else, have them to the right
    if (window.innerHeight > 700)
    {
        document.querySelector('#game-container').style.width = '600px';
        document.querySelector('#game-container').style.height = '700px';
        // needs to happen after resize
        BOARD_TL_X = document.querySelector('#game-container').getBoundingClientRect().left + window.scrollX;
        BOARD_TL_Y = document.querySelector('#game-container').getBoundingClientRect().top + window.scrollY;
        
        let index = 0;
        for (const piece of document.querySelectorAll('piece, nopiece'))
        {            
            // i feel dirty hardcoding this much
            const dx = (BOARD_TL_X) + (index * (PIECE_WIDTH + 5)) + 5;
            const dy = (BOARD_TL_Y + BOARD_HEIGHT) + 10;
            
            piece.style.left = `${dx}px`;
            piece.style.top = `${dy}px`;

            index++;
        }
    } else
    {
        document.querySelector('#game-container').style.width = '700px';
        document.querySelector('#game-container').style.height = '600px';
        
        BOARD_TL_X = document.querySelector('#game-container').getBoundingClientRect().left + window.scrollX;
        BOARD_TL_Y = document.querySelector('#game-container').getBoundingClientRect().top + window.scrollY;

        let index = 0;
        for (const piece of document.querySelectorAll('piece, nopiece'))
        {            
            const dx = (BOARD_TL_X + BOARD_WIDTH) + 10;
            const dy = (BOARD_TL_Y) + (index * (PIECE_WIDTH + 5)) + 5;
            
            piece.style.left = `${dx}px`;
            piece.style.top = `${dy}px`;

            index++;
        }
    }
}

window.onresize = setupPieces;

setupPieces();
 
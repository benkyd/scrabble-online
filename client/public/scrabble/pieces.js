
const BOARD_WIDTH = 600;
const BOARD_HEIGHT = 600;

// these change with resize
let BOARD_TL_X = document.querySelector('#game-container').getBoundingClientRect().left + window.scrollX;
let BOARD_TL_Y = document.querySelector('#game-container').getBoundingClientRect().top + window.scrollY;

const PIECE_WIDTH = 80;
const PIECE_HEIGHT = 80;

function updateBoardCoord()
{
    BOARD_TL_X = document.querySelector('#game-container').getBoundingClientRect().left + window.scrollX;
    BOARD_TL_Y = document.querySelector('#game-container').getBoundingClientRect().top + window.scrollY;
}

//https://stackoverflow.com/questions/11409895/whats-the-most-elegant-way-to-cap-a-number-to-a-segment
Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

function isCoordInBoard(px, py, pw, ph)
{
    updateBoardCoord();

    // to make it more readable
    let x = BOARD_TL_X;
    let y = BOARD_TL_Y;
    let w = BOARD_WIDTH;
    let h = BOARD_HEIGHT;

    console.log(x,y,w,h);

    // cheeky bit of AABB
    if (x < px + pw &&
        x + w > px &&
        y < py + ph &&
        y + h > py) return true;
    return false;
}


function piecePickedUp(piece)
{
    BoardSounds[2].play();


    piece.classList.add('dragging-piece');
}

function piecePlaced(piece)
{    
    
    // snap to board if in box
    if (isCoordInBoard(piece.offsetLeft, piece.offsetTop, 40, 40))
    {
        BoardSounds[0].play();
        
        // snap to grid
        

        piece.classList.remove('unplayed-piece');
        piece.classList.add('played-piece');
    } else
    {
        piece.classList.remove('dragging-piece');

        RackSounds[Math.floor(Math.random() * 3)].play();
        setupPieces();
    }
}


function setupPieces() // also resets pieces
{
    // if the window has enough vertical height to fit the peices,
    // have them at the bottom of the board, else, have them to the right
    if (window.innerHeight > 700)
    {
        document.querySelector('#game-container').style.width = '600px';
        document.querySelector('#game-container').style.height = '700px';
        // needs to happen after resize
        updateBoardCoord();
        
        let index = 0;
        for (const piece of document.querySelectorAll('piece, nopiece'))
        {
            if (piece.classList.contains('played-piece')) continue;

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
        
        updateBoardCoord();

        let index = 0;
        for (const piece of document.querySelectorAll('piece, nopiece'))
        {   
            if (piece.classList.contains('played-piece')) continue;
            
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
 
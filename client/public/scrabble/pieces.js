
const BOARD_W = 600;
const BOARD_H = 600;

// these change with resize
let BOARD_X = document.querySelector('#game-container').getBoundingClientRect().left + window.scrollX;
let BOARD_Y = document.querySelector('#game-container').getBoundingClientRect().top + window.scrollY;

// only when in drawer, otherwise 40
const PIECE_WIDTH = 80;
const PIECE_HEIGHT = 80;

//https://stackoverflow.com/questions/11409895/whats-the-most-elegant-way-to-cap-a-number-to-a-segment
Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

function updateBoardCoord()
{
    BOARD_X = document.querySelector('#game-container').getBoundingClientRect().left + window.scrollX;
    BOARD_Y = document.querySelector('#game-container').getBoundingClientRect().top + window.scrollY;
}

function isCoordInBoard(px, py, pw, ph)
{
    updateBoardCoord();

    // to make it more readable
    let x = BOARD_X;
    let y = BOARD_Y;
    let w = BOARD_W;
    let h = BOARD_H;

    // cheeky bit of AABB
    if (x < px + pw &&
        x + w > px &&
        y < py + ph &&
        y + h > py) return true;
    return false;
}

function placePieceSnapped(piece)
{
    updateBoardCoord();

    // snap to grid
    let x = BOARD_X - piece.offsetLeft + 20; // get center of piece
    let y = BOARD_Y - piece.offsetTop + 20;

    console.log(x,y);

    // make 1-15 so can work out what tile it's in
    x /= (BOARD_W / 15);
    y /= (BOARD_H / 15);
    
    console.log(x,y);


    x.clamp(1, 15);
    y.clamp(1, 15);

    console.log(x,y);


    y = Math.floor(y);
    x = Math.floor(x);

    console.log(x,y);

    x = BOARD_X - (x * 40) + 1; // back to px space
    x = BOARD_Y - (y * 40) + 1;

    console.log(x,y);
    console.log("");
    // undo offset
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
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
        updateBoardCoord();

        placePieceSnapped(piece);

        piece.classList.remove('unplayed-piece');
        piece.classList.add('played-piece');
        setupPieces();
    } else
    {
        DrawerSounds[Math.floor(Math.random() * 3)].play();
        
        piece.classList.add('unplayed-piece');
        piece.classList.remove('played-piece');
        piece.classList.remove('dragging-piece');

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
            const dx = (BOARD_X) + (index * (PIECE_WIDTH + 5)) + 5;
            const dy = (BOARD_Y + BOARD_H) + 10;
            
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
            
            const dx = (BOARD_X + BOARD_W) + 10;
            const dy = (BOARD_Y) + (index * (PIECE_WIDTH + 5)) + 5;
            
            piece.style.left = `${dx}px`;
            piece.style.top = `${dy}px`;

            index++;
        }
    }

    for (const piece of document.querySelectorAll('.played-piece'))
    {
        placePieceSnapped(piece);
    }
}

window.onresize = setupPieces;

setupPieces();
 
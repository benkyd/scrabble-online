
const BOARD_W = 600;
const BOARD_H = 600;

// these change with resize
let BOARD_X = document.querySelector('#game-container').getBoundingClientRect().left + window.scrollX;
let BOARD_Y = document.querySelector('#game-container').getBoundingClientRect().top + window.scrollY;

// is 80 while in drawer, otherwise 40
const PIECE_WIDTH = 80;
const PIECE_HEIGHT = 80;

//https://stackoverflow.com/questions/11409895/whats-the-most-elegant-way-to-cap-a-number-to-a-segment
Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

function updateBoardCoords()
{
    BOARD_X = document.querySelector('#game-container').getBoundingClientRect().left + window.scrollX;
    BOARD_Y = document.querySelector('#game-container').getBoundingClientRect().top + window.scrollY;
}

function isCoordInBoard(px, py, pw, ph)
{
    updateBoardCoords();

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

function boardCoordsFromScreenSpace(ssx, ssy)
{
    updateBoardCoords();
    let x = ssx - BOARD_X;
    let y = ssy - BOARD_Y;

    // make 1-15 so can work out what tile it's in
    x /= (BOARD_W / 15);
    y /= (BOARD_H / 15);

    x.clamp(1, 15);
    y.clamp(1, 15);

    y = Math.floor(y);
    x = Math.floor(x);

    return {x: x, y: y};
}

// places for board coordinate (0-14)
function placePiece(piece, x, y)
{
    x = (x * 40) + BOARD_X + 1;
    y = (y * 40) + BOARD_Y + 1;

    // undo offset
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
}

// events from drag & drop api
function piecePickedUp(piece)
{
    BoardSounds[2].play();

    piece.classList.add('dragging-piece');
}

// events from drag & drop api
function piecePlaced(piece)
{    
    
    // snap to board if in box
    if (isCoordInBoard(piece.offsetLeft, piece.offsetTop, 40, 40))
    {
        BoardSounds[0].play();
        updateBoardCoords();

        let coords = boardCoordsFromScreenSpace(piece.offsetLeft + 20, piece.offsetTop + 20);
        placePiece(piece, coords.x, coords.y);

        piece.classList.remove('unplayed-piece');
        piece.classList.add('played-piece');
        piece.dataset.coords = JSON.stringify(coords);

        setupPieces();
    } else
    {
        DrawerSounds[Math.floor(Math.random() * 3)].play();
        
        piece.classList.remove('played-piece');
        piece.classList.remove('dragging-piece');
        piece.classList.add('unplayed-piece');
        delete piece.dataset.coords;

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
        updateBoardCoords();
        
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
        
        updateBoardCoords();

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
        // cheating lol
        coords = JSON.parse(piece.dataset.coords);
        placePiece(piece, coords.x, coords.y);
    }
}

window.onresize = setupPieces;

setupPieces();
 
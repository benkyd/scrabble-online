
const BOARD_W = 600;
const BOARD_H = 600;

// these change with resize
let BOARD_X = document.querySelector('#game-container').getBoundingClientRect().left + window.scrollX;
let BOARD_Y = document.querySelector('#game-container').getBoundingClientRect().top + window.scrollY;

// is 80 while in drawer, otherwise 40
const PIECE_WIDTH = 80;
const PIECE_HEIGHT = 80;

let isHoldingPiece = false;

//https://stackoverflow.com/questions/11409895/whats-the-most-elegant-way-to-cap-a-number-to-a-segment
Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};


const Drawer = document.querySelector('#piece-drawer');

/*
TILE OBJECT
{

}
*/
let PiecesDrawer = [];

// Expects structure [{letter: '', score: int}]
// Returns array of tile IDs that were added
function addPiecesToDrawer(pieces)
{
    for (const piece of pieces)
    {
        const domPiece = document.createElement('piece');
        domPiece.innerText = piece.letter;
        domPiece.classList.add('unselectable');
        domPiece.classList.add('unplayed-piece');
        const score = document.createElement('score');
        score.innerText = piece.score;
        domPiece.appendChild(score);
        Drawer.appendChild(domPiece);
    }
    setupPieces();
    updatePieceEventListeners();
}

// Removes regardless of vadility
function removePiecesFromDrawer(pieces)
{

}


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

    x = x.clamp(0, 14);
    y = y.clamp(0, 14);

    y = Math.floor(y);
    x = Math.floor(x);

    return {x: x, y: y};
}

// places for board coordinate (0-14)
function placePieceOnBoard(piece, x, y)
{
    x = (x * 40) + BOARD_X + 1;
    y = (y * 40) + BOARD_Y + 1;

    // undo offset
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
}

function getPieceFromBoard(x, y)
{
    for (const piece of document.querySelectorAll('piece'))
    {
        if (!piece.dataset.coords) continue;
        let coords = JSON.parse(piece.dataset.coords);
        if (coords.x === x && coords.y === y)
            return piece;
    }
    return false;
}

// staged pieces are played but the turn is not applied
function getAllStagedPieces()
{
    let ret = [];
    for (const piece of document.querySelectorAll('.staged-piece'))
    {
        ret.push(piece);
    }
    return ret;
}

function getAllPiecesOnBoard()
{
    let ret = [];
    for (const piece of document.querySelectorAll('piece'))
    {
        if (piece.dataset.coords)
        {
            ret.push(piece);
        }
    }
    return ret;
}

// events from drag & drop api
function piecePickedUp(piece)
{
    if (!piece) return;
    if (isHoldingPiece) return;

    delete piece.dataset.coords;

    BoardSounds[2].play();

    piece.classList.add('small-piece');
    isHoldingPiece = true;
}

// events from drag & drop api
function piecePlaced(piece)
{    
    if (!piece) return;
    if (!isHoldingPiece) return;

    // snap to board if in box
    if (isCoordInBoard(piece.offsetLeft, piece.offsetTop, 40, 40))
    {
        updateBoardCoords();
        let coords = boardCoordsFromScreenSpace(piece.offsetLeft + 20, piece.offsetTop + 20);

        if (getPieceFromBoard(coords.x, coords.y)) return false;

        BoardSounds[0].play();

        placePieceOnBoard(piece, coords.x, coords.y);

        piece.classList.remove('unplayed-piece');
        piece.classList.add('staged-piece');
        piece.dataset.coords = JSON.stringify(coords);

        setupPieces();
    } else
    {
        DrawerSounds[Math.floor(Math.random() * 3)].play();
        
        piece.classList.remove('staged-piece');
        piece.classList.remove('small-piece');
        piece.classList.add('unplayed-piece');
        delete piece.dataset.coords;

        setupPieces();
    }

    isHoldingPiece = false;
    return true;
}


function setupPieces() // also resets pieces
{
    // TODO: this caused some weird html scaling bugs where the
    // flexboxes wouldn't update, fix this vvv
    // if the window has enough vertical height to fit the peices,
    // have them at the bottom of the board, else, have them to the right


    // needs to happen after resize
    updateBoardCoords();
    
    let index = 0;
    for (const piece of document.querySelectorAll('piece, nopiece'))
    {
        if (piece.classList.contains('played-piece') || piece.classList.contains('staged-piece')) continue;

        // i feel dirty hardcoding this much
        const dx = (BOARD_X) + (index * (PIECE_WIDTH + 5)) + 5;
        const dy = (BOARD_Y + BOARD_H) + 10;
        
        piece.style.left = `${dx}px`;
        piece.style.top = `${dy}px`;

        index++;
    }

    for (const piece of document.querySelectorAll('.played-piece, .staged-piece'))
    {
        // cheating lol
        if (!piece.dataset.coords) continue;
        let coords = JSON.parse(piece.dataset.coords);
        placePieceOnBoard(piece, coords.x, coords.y);
    }
}

setupPieces();
 
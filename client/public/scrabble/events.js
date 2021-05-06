const gameinfoRight = document.querySelector('#game-info-right');
const gameinfoLeft = document.querySelector('#game-info-left');
const gameinfoCompact = document.querySelector('#game-info-compact');


function windowResize()
{
    if (window.innerWidth < 1100)
    {
        gameinfoRight.style.display = 'none';
        gameinfoLeft.style.display = 'none';
        gameinfoCompact.style.display = 'block';
    } else
    {
        gameinfoRight.style.display = 'block';
        gameinfoLeft.style.display = 'block';
        gameinfoCompact.style.display = 'none';
    }

    setupPieces();
}
windowResize();


window.onresize = windowResize;

document.addEventListener('mousemove', mouseMove);
document.addEventListener('touchmove', mouseMove);
document.addEventListener('mouseup',   mouseUp);
document.addEventListener('touchend',  mouseUp);

function updatePieceEventListeners()
{
    document.querySelectorAll('piece').forEach(element => {
        element.addEventListener('mousedown', e => mouseDown(e, element));
        element.addEventListener('touchstart', e => mouseDown(e, element));
    });
}
updatePieceEventListeners();

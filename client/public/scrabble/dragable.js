// I decided not to use the drag and drop API
// purely because its very ugly

// i also assume there's no way a user's viewport isn't at least 700px tall
// bad assumption to make, but scroll pixels wouldn't scale

document.addEventListener('mousemove', mouseMove);
document.addEventListener('touchmove', mouseMove);
document.addEventListener('mouseup',   mouseUp);
document.addEventListener('touchend',  mouseUp);

document.querySelectorAll('piece').forEach(element => {
    element.addEventListener('mousedown', e => mouseDown(e, element));
    element.addEventListener('touchstart', e => mouseDown(e, element));
});

let state = {dx: 0, dy: 0};
let selectedElement = {};

function mouseDown(event, element)
{
    event.preventDefault();

    // disalow picking up of played pieces
    // if (element.classList.contains('played-piece')) return;

    piecePickedUp(element);
    
    if (event.type === 'touchstart')
        event = event.changedTouches[0];
    
    state.dx = Math.abs(element.offsetLeft - event.clientX);
    state.dy = Math.abs(element.offsetTop - event.clientY);
    
    element.pointerEvents = 'none';
    selectedElement = element;
    
    // move to the centre of the mouse to simulat pickup
    // selectedElement.style.top = event.clientY;
    // selectedElement.style.left = event.clientX;
}

function mouseMove(event)
{
    event.preventDefault();

    if (selectedElement.pointerEvents === 'none') {
   
        if (event.type === 'touchmove')
            event = event.changedTouches[0];

        // TODO: Scale for %
        selectedElement.style.left = `${event.clientX - state.dx}px`;
        selectedElement.style.top = `${event.clientY - state.dy}px`;
    }
}

function mouseUp(event)
{
    event.preventDefault();

    if (selectedElement.pointerEvents != 'initial')
    {
        piecePlaced(selectedElement);

        selectedElement.pointerEvents = 'initial';
    }

}

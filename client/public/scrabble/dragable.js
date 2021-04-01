// I decided not to use the drag and drop API
// purely because its very ugly

// i also assume there's no way a user's viewport isn't at least 700px tall
// bad assumption to make, but scroll pixels wouldn't scale

document.querySelector('#game-container').addEventListener('mousemove', mouseMove);
document.querySelector('#game-container').addEventListener('mouseup',   mouseUp);

document.querySelectorAll('piece').forEach(element => {
    element.addEventListener('mousedown', e => mouseDown(e, element));
});

let state = {dx: 0, dy: 0};
let selectedElement = {};

function mouseDown(event, element)
{
    event.preventDefault();

    // TODO: allow drag api (on mobile)
    state.dx = Math.abs(element.offsetLeft - event.clientX);
    state.dy = Math.abs(element.offsetTop - event.clientY);

    
    // move to the centre of the mouse to simulat pickup
    // can also play a sound

    element.pointerEvents = 'none';
    selectedElement = element;
}

function mouseMove(event)
{
    event.preventDefault();

    if (selectedElement.pointerEvents === 'none') {
   
        // TODO: Scale for %
        selectedElement.style.left = `${event.clientX - state.dx}px`;
        selectedElement.style.top = `${event.clientY - state.dy}px`;
    }
}

function mouseUp(event)
{
    event.preventDefault();
    selectedElement.pointerEvents = 'initial';
}

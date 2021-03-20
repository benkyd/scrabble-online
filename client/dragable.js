// I decided not to use the drag and drop API
// purely because its very ugly


document.querySelector('#game-container').addEventListener('mousemove', mouseMove);
document.querySelector('#game-container').addEventListener('mouseup',   mouseUp);


document.querySelectorAll('piece').forEach(element => {
    element.addEventListener('mousedown', e => mouseDown(e, element));
    // element.addEventListener('mousemove', e => mouseMove(e, element));
    // element.addEventListener('mouseup', e => mouseUp(e, element));
});

let state = {dx: 0, dy: 0};
let selectedElement = {};

function mouseDown(event, element)
{
    event.preventDefault();

    state.dx = Math.abs(element.offsetLeft - event.clientX);
    state.dy = Math.abs(element.offsetTop - event.clientY);

    element.pointerEvents = 'none';
    selectedElement = element;

    console.log(element);
}

function mouseMove(event)
{
    event.preventDefault();

    if (selectedElement.pointerEvents === 'none') {
   
        // Update top/left directly in the dom element:
        selectedElement.style.left = `${event.clientX - state.dx}px`;
        selectedElement.style.top = `${event.clientY - state.dy}px`;
    }
}

function mouseUp(event)
{
    event.preventDefault();
    selectedElement.pointerEvents = 'initial';
}

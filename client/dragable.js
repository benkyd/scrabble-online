// I decided not to use the drag and drop API
// purely because its very ugly

document.querySelector('#game-container').addEventListener('mousemove', mouseMove);
document.querySelector('#game-container').addEventListener('mouseup',   mouseUp);

document.querySelectorAll('piece').forEach(element => {
    element.addEventListener('mousedown', e => mouseDown(e, element));
});

function mouseDown(event, element = 'none')
{
    event.preventDefault();

    console.log(element, event);
}

function mouseMove(event, element = 'none')
{
    event.preventDefault();

}

function mouseUp(event, element = 'none')
{
    event.preventDefault();
    
    console.log(element, event);
}

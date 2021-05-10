// I decided not to use the drag and drop API
// purely because its very ugly

let selectedElement = {};
let lastCoords = { x: 0, y: 0 };

function magnitude(v)
{
    return Math.sqrt((v.x * v.x) + (v.y * v.y));
}

function mouseDown(event, element)
{
    event.preventDefault();

    // disalow picking up of played pieces
    if (element.classList.contains('played-piece') || element.classList.contains('locked')) return;

    piecePickedUp(element);
    
    if (event.type === 'touchstart')
        event = event.changedTouches[0];
    
    element.pointerEvents = 'none';

    selectedElement = element;
    
    // move to the centre of the mouse to simulate pickup
    selectedElement.style.left = `${window.scrollX + (event.clientX - 20)}px`;
    selectedElement.style.top = `${window.scrollY + (event.clientY - 20)}px`;
    selectedElement.velocity = {x: 0, y: 0};
}

function mouseMove(event)
{
    if (selectedElement.pointerEvents === 'none') {
        event.preventDefault();
   
        if (event.type === 'touchmove')
            event = event.changedTouches[0];

        // do some funky velocity stuff
        selectedElement.velocity.x = (window.scrollX + (event.clientX - 20)) - lastCoords.x;
        selectedElement.velocity.y = (window.scrollY + (event.clientY - 20)) - lastCoords.y;

        selectedElement.style.left = `${window.scrollX + (event.clientX - 20)}px`;
        selectedElement.style.top = `${window.scrollY + (event.clientY - 20)}px`;

        lastCoords.x = window.scrollX + (event.clientX - 20);
        lastCoords.y = window.scrollY + (event.clientY - 20);
    }
}

function slidePiece(piece)
{
    const id = setInterval(() => 
    {
        if (magnitude(piece.velocity) <= 1)
        {
            piecePlaced(piece);
            clearInterval(id);
            return;
        }
        piece.style.left = `${piece.getBoundingClientRect().left + piece.velocity.x}px`;
        piece.style.top = `${piece.getBoundingClientRect().top + piece.velocity.y}px`;
        piece.velocity.y *= 0.95;
        piece.velocity.x *= 0.95;
    }, 16);
}

function mouseUp(event)
{
    if (event.target.localName !== 'score') return;

    event.preventDefault();
    
    if (selectedElement.pointerEvents != 'initial')
    {
        if (!selectedElement.velocity)
        {
            if (piecePlaced(selectedElement))
            {
                selectedElement.pointerEvents = 'initial';
            }
        } else 
        {
            if (magnitude(selectedElement.velocity) <= 1)
            {
                if (piecePlaced(selectedElement))
                {
                    selectedElement.pointerEvents = 'initial';
                }
            }
            else
            {
                slidePiece(selectedElement);
                selectedElement.pointerEvents = 'initial';
            }
        }
    }
}

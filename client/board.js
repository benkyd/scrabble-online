// traverse HTML and fill in table

const BoardLookup = {
    'TL': 'tripple-letter',
    'DL': 'double-letter',
    'TW': 'tripple-word',
    'DW': 'double-word',
    '★': 'center-star'
};

const BoardLocations = {
    'A1': 'TW',
    'D1': 'DL',
    'H1': 'TW',
    'L1': 'DL',
    'O1': 'TW',
    'B2': 'DW',
    'F2': 'TL',
    'J2': 'TL',
    'N2': 'DW',
    'C3': 'DW',
    'G3': 'DL',
    'I3': 'DL',
    'M3': 'DW',
    'A4': 'DL',
    'D4': 'DW',
    'H4': 'DL',
    'L4': 'DW',
    'O4': 'DL',
    'E5': 'DW',
    'K5': 'DW',
    'B6': 'TL',
    'F6': 'TL',
    'J6': 'TL',
    'N6': 'TL',
    'C7': 'DL',
    'G7': 'DL',
    'I7': 'DL',
    'M7': 'DL',
    'A8': 'TW',
    'D8': 'DL',
    'H8': '★',
    'L8': 'DL',
    'O8': 'TW'
};

function flip(y, size)
{
    return -y + size + 1;
}

window.onload = e => {
    for (const location in BoardLocations)
    {
        const x = location[0].toLowerCase();
        const y = location[1];

        const boardLocation = document.querySelector(`#row-${y}`).querySelector(`#col-${x}`);

        boardLocation.classList.add(BoardLookup[BoardLocations[location]]);
        boardLocation.innerHTML = BoardLocations[location];
    }

    // flip it
    
    for (const location in BoardLocations)
    {
        const x = location[0].toLowerCase();
        let y = location[1];

        y = flip(y, 15);

        const boardLocation = document.querySelector(`#row-${y}`).querySelector(`#col-${x}`);

        boardLocation.classList.add(BoardLookup[BoardLocations[location]]);
        boardLocation.innerHTML = BoardLocations[location];
    }
};

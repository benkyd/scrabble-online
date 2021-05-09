// traverse HTML and fill in table

const BoardLookup = {
    'TL': 'tripple-letter',
    'DL': 'double-letter',
    'TW': 'tripple-word',
    'DW': 'double-word',
    '★': 'center-star'
};

// This was automatically generated, the code for it is lonnnggg gone
const BoardLocations = {
    "0,0": "TW",
    "0,3": "DL",
    "0,7": "TW",
    "0,11": "DL",
    "0,14": "TW",
    "1,1": "DW",
    "1,5": "TL",
    "1,9": "TL",
    "1,13": "DW",
    "2,2": "DW",
    "2,6": "DL",
    "2,8": "DL",
    "2,12": "DW",
    "3,0": "DL",
    "3,3": "DW",
    "3,7": "DL",
    "3,11": "DW",
    "3,14": "DL",
    "4,4": "DW",
    "4,10": "DW",
    "5,1": "TL",
    "5,5": "TL",
    "5,9": "TL",
    "5,13": "TL",
    "6,2": "DL",
    "6,6": "DL",
    "6,8": "DL",
    "6,12": "DL",
    "7,0": "TW",
    "7,3": "DL",
    "7,7": "★",
    "7,11": "DL",
    "7,14": "TW",
    "8,2": "DL",
    "8,6": "DL",
    "8,8": "DL",
    "8,12": "DL",
    "9,1": "TL",
    "9,5": "TL",
    "9,9": "TL",
    "9,13": "TL",
    "10,4": "DW",
    "10,10": "DW",
    "11,0": "DL",
    "11,3": "DW",
    "11,7": "DL",
    "11,11": "DW",
    "11,14": "DL",
    "12,2": "DW",
    "12,6": "DL",
    "12,8": "DL",
    "12,12": "DW",
    "13,1": "DW",
    "13,5": "TL",
    "13,9": "TL",
    "13,13": "DW",
    "14,0": "TW",
    "14,3": "DL",
    "14,7": "TW",
    "14,11": "DL",
    "14,14": "TW"
};

function flip(y, size)
{
    return -y + size + 1;
}

window.onload = e => {
    for (const location in BoardLocations)
    {
        const x = String.fromCharCode(parseInt(location.split(',')[0]) + 65).toLowerCase();
        const y = parseInt(location.split(',')[1]) + 1;
        
        const boardLocation = document.querySelector(`#row-${y}`).querySelector(`#col-${x}`);

        boardLocation.classList.add(BoardLookup[BoardLocations[location]]);
        boardLocation.classList.add('unselectable');
        let localeThing = BoardLocations[location];

        // hacky but it works
        if (localStorage.getItem('locale') === "es" || localStorage.getItem('locale') === "pt")
        {
            localeThing = localeThing.replace('W', 'P');
        }

        boardLocation.innerHTML = localeThing;
    }
};

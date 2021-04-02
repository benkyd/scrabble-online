// preload sounds

// i don't care if the browser doesnt support
// mp3, i'm not making this for compatability

const BoardSounds = [
    new Audio('../place1.mp3'), // pickup
    new Audio('../place2.mp3'), // unused
    new Audio('../place3.mp3') // place
];

const DrawerSounds = [
    new Audio('../drawer1.mp3'),
    new Audio('../drawer2.mp3'),
    new Audio('../drawer3.mp3')
];

BoardSounds.forEach(sound => {
    sound.addEventListener('loadeddata', () => {
        sound.volume = 1;
    });
});

DrawerSounds.forEach(sound => {
    sound.addEventListener('loadeddata', () => {
        sound.volume = 1;
    });
});

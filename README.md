# Scrabble (Multiplayer)
## 2020/21 L4 Application Programming coursework

SEE BELOW FOR CONFIGURATION GUIDE

### Product Description

The following resources were used for the creation of the game's logic:
* https://scrabble.hasbro.com/en-us/rules
* https://www.zapsplat.com/?s=scrabble
* https://www.scrabble3d.info/t2342f139-Default-rules.html

Simple client/server scrabble game implemented in JavaScript with lots of room to add support for stuff like databases in the future.

### Configuration Guide

Make sure your working directory is root/server/

1. run ```npm i```
2. run ```npm run setup```
3. run ```npm run start```

If you want a custom port create a .env file and use the variable PORT
or just use environment variables

You can play in singleplayer or multiplayer, both is accessable at localhost:8080 upon running

To play singleplayer, simply press the singleplayer button, but note that there is no AI or opponent, you simply get a board to play with.
 
To play multiplayer, simply find (or force) a friend to also load the site from your private IP or whatever other networking solution you may have, both enter your name on the home page. One of you needs to create a lobby and the other needs to join it with the buttons labled as such, press ready then bam, you're in a game. Turns are denoted by the colour on the person at the top left, if it's your turn. your name will be green, if it's theirs, their name will be blue. 

PLEASE REMEMBER TO RESTART THE SERVER IF THE HOST OF THE GAME DISCONNECTS DURING THE GAME

If it's really not working, here's a really quick demo of when it did https://gyazo.com/b0ac3ad2d8627e8a79098b91403749e2

Remember to read the bottom of TODO and enjoy :)

### Implementation Rationale

These are some of my thoughts behind why I implemeneted stuff the way I did. To see more, take a look at TODO.

#### The Server
server/src/game-logic.js is probably the file you're looking for :)

The server is a node express server that runs on HTTP so that websockets can be routed through the same port. I use socket.io because it's a comfortable abstraction over the already high-level websocket API.

All of the code on the server seperates domain logic from networking logic (see comments in files) to keep the code clean and the API simple and understandable.

#### The Client
I chose to support multiple languages in this project to make it more accessable to people if they wish to translate it.

The solution to locale-ise language in HTML is extremely naive and there are a lot better ways to do it, I did what I could in the time without a full refractor and SSR.
However it is not at much detriment of readability and maintainability of the code so I didn't deem it neccesary. However, it is unfinished.

The locales are stored in different language files so it is easier for people to contribute and thus more maintanable.

#### General Code
If the scope allowed for it, every function would be (reasonably) unit tested. 

### Bugs and Issues

Prettymuch all of the bugs i'm aware of occur when a user reconnects to a game that's taking place. ESPECIALLY if that user is the host of the game

### Contributing
To contribute a translation there's a few scripts that need to be run:

To see what needs to be completed code-wise, take a look at `TODO`, there you will find tasks that need to be completed as well as known bugs. There's also a lot of TODOs in the code :)

### Acknowledgements

Express.js - HTTP Routing and Management

Socket.io - Socket Routing and Management

Inês Filipa Baiõa Antunes - Tranlations (Portuguese, Spanish)

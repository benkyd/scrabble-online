const Logger = require('./logger.js');
const WebServer = require('./webserver.js');
const Game = require('./game.js');
const Error = require('./error.js');
const Dist = require('./letter-distributions.js');

let io = {};

/**
 * All socket communication follows a standard call/response & event
 * flow, subsiquent communication call event names will be layered
 * with '-', for example identify-error is sent AFTER identify IF error
 * 
 * Once in a game, the communiation will be less back and fourth and 
 * more event/response based
 * 
 * Again, networking code will be seperated from domain logic with sockets
 * 
 * Sockets will error with HTTP error codes because it's a pretty decent
 * standard for standard errors that may occur. Then general errors will
 * be 500 errors with a description
 * 
 * Clients connect to identify with an 'intent' to be placed in a game or to
 * be part of the lobbying system, the intent of the client defines what 
 * sort of communication they will be recieving
 */

// TODO: stop trusting the users UID, lookup with their connection ID

function init()
{
    io = require('socket.io')(WebServer.Server);
    io.on('connection', (socket) => {
        Logger.info(`NEW SOCKET CIENT ID ${socket.id}`);
        // Pass socket onto router
        Router(socket);
    })

    Logger.info('SOCKET SERVER LISTENING');
}


module.exports = {
    init: init
}



async function Router(socket)
{
    // First, ask socket to identify it's self
    // everything else should be event / intent
    // based
    socket.emit('identify');

    // identify functions
    socket.on('identify', args => ClientIdentify(socket, args));
    socket.on('identify-update-intent', args => UpdateIntent(socket, args));

    // lobby functions
    socket.on('lobby-create', args => LobbyCreate(socket, args));
    socket.on('lobby-join', args => LobbyJoin(socket, args));
    socket.on('lobby-leave', args => LobbyLeave(socket, args));
    
    socket.on('lobby-user-ready', args => LobbyUserReady(socket, args));
    socket.on('lobby-user-unready', args => LobbyUserUnReady(socket, args));
    
    
    // game functions
    // socket will emit game begin with play order and starting tiles
    // once all clients have connected with identify
    socket.on('lobby-game-begin', args => LobbyGameBegin(socket, args));
    socket.on('game-play-turn', args => GamePlayTurn(socket, args))
    socket.on('game-skip-turn', args => GamePlayTurn(socket, {skip: true}));
    socket.on('game-exchange-tiles', args => GameExchangeTiles(socket, args));


    socket.on('disconnect', args => HandleDisconnect(socket, ...args));

}


function ClientIdentify(socket, args)
{
    const err = new Error;
    
    const user = Game.Registrar.GetUserByUID(args.userid);
    const intent = args.intent;

    if (!user)
    {
        err.addError(400, 'Bad Request', 'error-unknown-uid');
        socket.emit('identify-error', err.toError);
        return;
    }

    if (!intent)
    {
        err.addError(400, 'Bad Request', 'error-bad-intent');
        socket.emit('identify-error', err.toError);
        return;
    }

    const oldIntent = user.intent;
    
    Game.Registrar.ChangeUserIntent(user.uid, intent);
    const status = Game.Registrar.UserConnect(user.uid, socket.id, intent);


    // User reconnecting to game after disconnect (Not sure what this entails, mainly for debugging)
    if (intent === 'GAME' && oldIntent === 'GAME')
    {        
        // TODO: lobby is left when user disconnects, do this properly you lazy shit
        const lobby = Game.Lobbies.GetLobbyByUserUID(user.uid);
        const game = Game.Logic.GetGameByUserUID(user.uid);

        if (!game)
        {
            err.addError(500, 'Internal Server Error', 'error-illegal-intent');
            socket.emit('identify-error', err.toError);
            return;
        }
        socket.emit('identify-success', {connected: true, user: user});

        socket.join(lobby.uid);
        
        Logger.game(`USER ${user.uid} (${user.username}) IS RECONNECTING TO GAME ${game.uid}`);

        EmitGameReconnect(user, game);
        return;
    }

    // If the user enters a game without transitioning, no bueno
    if (intent === 'GAME' && oldIntent !== 'GAMETRANSITION')
    {
        err.addError(500, 'Internal Server Error', 'error-illegal-intent');
        socket.emit('identify-error', err.toError);
        return;
    }

    // User intends to enter a game
    if (intent === 'GAME' && oldIntent === 'GAMETRANSITION')
    {
        // Make sure the user is actually in this game
        const lobby = Game.Lobbies.GetLobbyByUserUID(user.uid);
        if (lobby.uid !== args.lobbyuid)
        {
            err.addError(500, 'Internal Server Error', 'error-illegal-intent');
            socket.emit('identify-error', err.toError);
            return;
        }

        Game.Lobbies.UserConnectGame(user.uid);

        // Users at this point don't go through lobbying code
        // so make sure that they are joined into a lobby for
        // the networking
        socket.join(lobby.uid);
        console.log(io.sockets.adapter.rooms);

        // If this user was the last player in the lobby to connect
        // start the game and tell every connected user
        if (Game.Lobbies.IsLobbyReadyForGame(lobby.uid))
        {
            Logger.debug(`ALL PLAYERS IN LOBBY ${lobby.uid} ARE CONNECTED TO GAME`);
            // Make sure the last user to start the game is in the correct 
            // state to recieve the game-begin packet
            socket.emit('identify-success', {connected: true, user: user});

            const game = Game.Logic.BeginGame(lobby);
            
            Logger.game(`GAME ${lobby.uid} IS BEGINNING`);

            EmitGameBegin(game);

            return;
        }
    }

    if (status === true)
    {
        socket.emit('identify-success', {connected: true, user: user});
    } else if (status === 'error-taken-user-connection')
    {
        err.addError(500, 'Internal Server Error', 'error-taken-user-connection');
        socket.emit('identify-error', err.toError);
    } else
    {
        err.addError(500, 'Internal Server Error', 'error-illegal-user');
        socket.emit('identify-error', err.toError);
    }
}

// TODO: add checks to all these functions
function UpdateIntent(socket, args)
{
    const user = Game.Registrar.GetUserbyConnection(socket.id);

    const intent = args.intent;
    Game.Registrar.ChangeUserIntent(user.uid, intent);
}


// if i use a database in the future i need to consider that the lobby
// name is not yet sanatised
function LobbyCreate(socket, args)
{
    const err = new Error;

    const useruid = args.user.uid;

    if (!useruid)
    {
        err.addError(400, 'Bad Request', 'Unknown uid');
        socket.emit('lobby-create-error', err.toError);
        return;
    }

    if (!args.lobbyName || args.lobbyPrivate === undefined || args.lobbySpectators === undefined)
    {
        err.addError(400, 'Bad Request', 'Lobby malformed');
        socket.emit('lobby-create-error', err.toError);
        return;
    }

    // Make sure user is who they say they are
    const user = Game.Registrar.GetUserbyConnection(socket.id);
    if (!user || user.uid != useruid)
    {
        err.addError(403, 'Forbidden', 'error-illegal-user');
        socket.emit('lobby-create-error', err.toError);
        return;
    }

    // Make sure user isn't already in a lobby or owns one
    if (!Game.Lobbies.CheckUserAvailability(useruid))
    {
        err.addError(400, 'Bad Request', 'error-taken-lobby-ownership');
        socket.emit('lobby-create-error', err.toError);
        return;
    }

    const lobby = Game.Lobbies.RegisterLobby(useruid, args.lobbyName, args.lobbyPrivate, args.lobbySpectators);

    if (!lobby)
    {
        err.addError(500, 'Internal Server Error', 'error-illegal-lobby');
        socket.emit('lobby-create-error', err.toError);
        return;
    }

    // Lobby created
    socket.emit('lobby-create-success', {created: true, lobby: lobby});

    const lobbyJoined = Game.Lobbies.UserJoinLobby(lobby.uid, useruid, LobbyUpdateCallback);
    if (!lobbyJoined)
    {
        err.addError(403, 'Forbidden', 'error-cannot-join-lobby');
        socket.emit('lobby-create-error', err.toError);
        return;
    }

    if (lobbyJoined.uid !== lobby.uid)
    {
        err.addError(500, 'Internal Server Error', 'error-illegal-lobby');
        socket.emit('lobby-create-error', err.toError);
        return;
    }
    
    socket.join(lobby.uid);
    socket.emit('lobby-join-success', lobby);
}

function LobbyJoin(socket, args)
{
    const err = new Error;

    const useruid = args.user.uid;

    if (!useruid)
    {
        err.addError(400, 'Bad Request', 'error-unknown-uid');
        socket.emit('lobby-join-error', err.toError);
        return;
    }

    if (!args.lobbyuid || args.joinAsSpectator === undefined)
    {
        err.addError(400, 'Bad Request', 'error-malformed-lobby');
        socket.emit('lobby-join-error', err.toError);
        return;
    }

    // Make sure user is who they say they are
    const user = Game.Registrar.GetUserbyConnection(socket.id);
    if (!user || user.uid != useruid)
    {
        err.addError(403, 'Forbidden', 'error-illegal-user');
        socket.emit('lobby-join-error', err.toError);
        return;
    }

    // Make sure user isn't already in a lobby
    if (!Game.Lobbies.CheckUserAvailability(useruid))
    {
        err.addError(400, 'Bad Request', 'error-taken-lobby-ownership');
        socket.emit('lobby-join-error', err.toError);
        return;
    }

    const lobby = Game.Lobbies.GetLobbyByUID(args.lobbyuid);
    if (!lobby)
    {
        err.addError(400, 'Bad Request', 'error-lobby-not-exist');
        socket.emit('lobby-join-error', err.toError);
        return;
    }

    if (args.joinAsSpectator)
    {
        // TODO: this lol
    } else 
    {
        const status = Game.Lobbies.UserJoinLobby(lobby.uid, useruid, LobbyUpdateCallback);
    
        if (!status)
        {
            err.addError(403, 'Forbidden', 'error-cannot-join-lobby');
            socket.emit('lobby-join-error', err.toError);
            return;
        }

        socket.join(lobby.uid);
        socket.emit('lobby-join-success', lobby);
    }
}

function LobbyLeave(socket, args)
{
    const user = Game.Registrar.GetUserbyConnection(socket.id);
    const lobby = Game.Lobbies.GetLobbyByUserUID(user.uid);
    Logger.debug(`USER ${user.uid} (${Game.Registrar.GetUserByUID(user.uid).username}) ATTEMPTING TO LEAVE LOBBY`);
    socket.leave(lobby.uid);
    Game.Lobbies.UserLeaveLobby(user.uid, LobbyUpdateCallback);
}

function LobbyUserReady(socket, args)
{
    const user = Game.Registrar.GetUserbyConnection(socket.id);
    const lobby = Game.Lobbies.GetLobbyByUserUID(user.uid);

    if (!Game.Lobbies.UserReady(user.uid, LobbyUpdateCallback)) return;
    
    Logger.debug(`USER ${user.uid} (${Game.Registrar.GetUserByUID(user.uid).username}) READY`);

    if (Game.Lobbies.IsLobbyReady(lobby.uid)) LobbyUpdateCallback(user, lobby, 'game-ready');
}

function LobbyUserUnReady(socket, args)
{
    const user = Game.Registrar.GetUserbyConnection(socket.id);
    const lobby = Game.Lobbies.GetLobbyByUserUID(user.uid);

    if (!Game.Lobbies.UserUnReady(user.uid, LobbyUpdateCallback)) return;
    
    Logger.debug(`USER ${user.uid} (${Game.Registrar.GetUserByUID(user.uid).username}) UNREADY`);

    if (!Game.Lobbies.IsLobbyReady(lobby.uid)) LobbyUpdateCallback(user, lobby, 'game-unready');
}


function LobbyGameBegin(socket, args) 
{
    const user = Game.Registrar.GetUserbyConnection(socket.id);
    const lobby = Game.Lobbies.GetLobbyByUserUID(user.uid);
    // TODO: Maybe only the owner of the lobby should be able to begin the game

    // Tells all other clients in the lobby to change intent to transition
    // the clients don't need to request the server change their intent
    // except the host that started the transition
    for (const user of lobby.players)
    {
        Game.Registrar.ChangeUserIntent(user.uid, 'GAMETRANSITION');
    }
    for (const user of lobby.spectators)
    {
        Game.Registrar.ChangeUserIntent(user.uid, 'GAMETRANSITION');
    }

    io.to(lobby.uid).emit('request-intent-change', { intent: 'GAMETRANSITION', lobby: lobby });
}

function GamePlayTurn(socket, args)
{
    const user = Game.Registrar.GetUserbyConnection(socket.id);
    const game = Game.Logic.GetGameByUserUID(user.uid);

    if (!user || !game)
    {
        // do something bad
        return; 
    }

    Logger.game(`USER ${user.uid} (${user.username}) IS ATTEMPTING TO PLAY A TURN IN GAME ${game.uid}`);

    if (args.skip === true)
    {
        const [outcome, turninfo] = Game.Logic.SkipTurn(game.uid, user.uid);
        io.to(game.uid).emit('game-turn-processed', {
            outcome: outcome
        });

        const nextuser = Game.Registrar.GetConnectionByUser(turninfo.turnplayer.uid);
        
        io.to(game.uid).emit('game-turn-start', {
            turninfo: turninfo
        });

        io.to(nextuser).emit('game-your-turn');
    } else
    {
        // TODO: validate args
        const [err, outcome, turninfo, newuserpieces] = Game.Logic.PlayTurn(game.uid, user.uid, args)
        
        // process errors
        if (err)
        {
            socket.emit('game-turn-error', err);
            return;
        }

        socket.emit('game-new-pieces', {pieces: newuserpieces});

        io.to(game.uid).emit('game-turn-processed', {
            outcome: outcome
        });

        const nextuser = Game.Registrar.GetConnectionByUser(turninfo.turnplayer.uid);
        
        io.to(game.uid).emit('game-turn-start', {
            turninfo: turninfo
        });

        io.to(nextuser).emit('game-your-turn');
    }
    require('fs').appendFileSync('../turns-debug.json', JSON.stringify(Game.Logic.GetGameByUserUID(user.uid), null, 4));
}

function GameExchangeTiles(socket, args)
{

}


function HandleDisconnect(socket, args)
{
    const user = Game.Registrar.GetUserbyConnection(socket.id);
    if (!user) return;
    
    // if user is in a game, notify the game logic
    // if the user is the last user in a game - delete it
    // if the user is leaving, change their status so reconnect is allowed
    // TODO: VERY IMPORTANTTTT THAT^^^

    // quick fix, prevents game destruction
    // if (user.intent === 'GAME')
    // {
    //     Game.Registrar.UserDisconnect(user.uid);
    //     Logger.info(`SOCKET ${socket.id} DISCONNECTED FROM GAME`);
    //     return;
    // }

    // if user is in a lobby, leave and if user own's a lobby, destruct
    // leave lobby before user is disconnected
    if (user.intent !== 'GAMETRANSITION')
    {
        LobbyLeave(socket);
    }

    Game.Registrar.UserDisconnect(user.uid);
    
    Logger.info(`SOCKET ${socket.id} DISCONNECTED`);
}


/**
 * Possible states
 * 
 * lobby-deregister
 * lobby-join
 * lobby-leave 
 * user-ready
 * user-unready
 * game-ready
 * game-unready
 */
function LobbyUpdateCallback(user, lobby, state)
{
    // Just send updated lobby object for now
    io.to(lobby.uid).emit('lobby-update', {
        state: state, 
        updateuser: Game.Registrar.GetSafeUserByUID(user.uid), 
        lobby: lobby
    });
    Game.Lobbies.IsLobbyReady(lobby.uid)
}



// send the client their user as well as the rest of the game
// works at any point during the game as the client will always
// setup a game not assuming begining - also fresh games have a
// populated gamestates array
function EmitGameBegin(game)
{
    // Instead of using io.to(room), i'm sending an individual packet to everyone
    // in the game so that i can customise the game object that they recieve
    for (const user of game.players)
    {
        const gameuser = game.players.filter(i => i.uid === user.uid)[0];
        const gameuserconnection = Game.Registrar.GetConnectionByUser(gameuser.uid);

        // TODO: consider not sending all users the entire game state
        // due to cheating - a few more considerations and maybe a 
        // getsafegame function is needed
        io.to(gameuserconnection).emit('game-begin', {
            game: game,
            tileset: Dist.GetDist(game.locale).dist,
            gameuser: gameuser
        });
    }

    // Let starting player know it's their turn
    const userturnstart = Game.Logic.GetTurnUser(game.uid).uid;
    const userturnstartconnection = Game.Registrar.GetConnectionByUser(userturnstart);

    io.to(userturnstartconnection).emit('game-your-turn');

    Logger.debug(JSON.stringify(game.players, null, 2));
}

function EmitGameReconnect(user, game)
{
    const gameuser = game.players.filter(i => i.uid === user.uid)[0];
    const gameuserconnection = Game.Registrar.GetConnectionByUser(gameuser.uid);

    io.to(gameuserconnection).emit('game-begin', {
        game: game,
        tileset: Dist.GetDist(game.locale).dist,
        gameuser: gameuser
    });

    // If it's their turn, pass it to them
    // NOTE it shouldn't ever be their turn on a reconnect
    // as the game logic should pass control to next player
    // as the game order is changed
    if (!Game.Logic.GetTurnUser(game.uid)) return;
    const userturnstart = Game.Logic.GetTurnUser(game.uid).uid;
    if (userturnstart === user.uid)
    {    
        io.to(gameuserconnection).emit('game-your-turn');
    } else
    {
        // TODO: this needs to send game heuristics
        io.to(gameuserconnection).emit('game-turn-start');
    }
    
    Logger.debug(JSON.stringify(game.players, null, 2));
}


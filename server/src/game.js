const Registrar = require('./game-registrar.js');
const Lobbies = require('./lobbies.js');
const GameLogic = require('./game-logic.js')

/**
 * This is just to manage the "game" module
 * and control logic for the game, seperating
 * networking, game logic and domain logic
 */

module.exports = {
    Registrar: Registrar,
    Lobbies: Lobbies,
    Logic: GameLogic
}

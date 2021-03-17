const colours = require('colors/safe');
const moment = require('moment');
const fs = require('fs');

let LogLevel = 1;
let Dialect;
let logPath = 'logs.log';
let dateFormat = 'DD-MM-YY HH:mm:ss'

module.exports.init = async function(path) {
    if (path) logPath = path;

    Dialect = process.env.NODE_ENV == 'production' ? 'MARIADB' : 'SQLITE';

    if (!fs.existsSync(logPath)) {
        fs.writeFileSync(logPath, '');
    }
    fs.appendFileSync(logPath, '[SYSTEM STARTING UP] \n');

    console.log(colours.rainbow('Starting up...'));
}

module.exports.SetLevel = function(level) {
    LogLevel = level;
}

module.exports.SetDialect = function(dialect) {
    Dialect = dialect;
}

module.exports.SetDateFormat = function(format) {
    dateFormat = format;
}

module.exports.VERBOSE_LOGS = 0;
module.exports.DEBUG_LOGS   = 1;
module.exports.INFO_LOGS    = 2;
module.exports.WARN_LOGS    = 3;

module.exports.welcome = function() {
    // Unused
}

module.exports.database = function(message) {
    let d = moment().format(dateFormat);
    fs.appendFileSync(logPath, `[${d.toLocaleString()}] [${Dialect}] ${message} \n`);
    if (LogLevel > 0) return; 
    console.log('[' + d.toLocaleString() + '] [' 
        + colours.magenta(Dialect) + '] ' + message);
}

module.exports.game = function(message) {
    let d = moment().format(dateFormat);
    fs.appendFileSync(logPath, `[${d.toLocaleString()}] [GAME] ${message} \n`);
    if (LogLevel > 1) return; 
    console.log('[' + d.toLocaleString() + '] [' 
        + colours.brightBlue('GAME') + '] ' + message);
}

module.exports.middleware = function(origin, message) {
    let d = moment().format(dateFormat);
    fs.appendFileSync(logPath, `[${d.toLocaleString()}] [MIDDLEWARE: ${origin}] ${message} \n`);
    if (LogLevel > 0) return; 
    console.log('[' + d.toLocaleString() + '] [' 
        + colours.yellow(`MIDDLEWARE: ${origin}`) + '] ' + message);
}

module.exports.debug = function(message) {
    let d = moment().format(dateFormat);
    fs.appendFileSync(logPath, `[${d.toLocaleString()}] [DEBUG] ${message} \n`);
    if (LogLevel > 1) return; 
    console.log('[' + d.toLocaleString() + '] [' 
        + colours.cyan('DEBUG') + '] ' + message);
}

module.exports.ready = function() {
    let d = moment().format(dateFormat);
    fs.appendFileSync(logPath, `[${d.toLocaleString()}] [READY] \n`);
    console.log('[' + d.toLocaleString() + '] ['
        + colours.rainbow('READY') + ']');
}
    
module.exports.info = function(message) {
    let d = moment().format(dateFormat);
    fs.appendFileSync(logPath, `[${d.toLocaleString()}] [INFO] ${message} \n`);
    if (LogLevel > 2) return; 
    console.log('[' + d.toLocaleString() + '] [' 
        + colours.green('INFO') + '] ' + message);
}

module.exports.warn = function(message) {
    let d = moment().format(dateFormat);
    fs.appendFileSync(logPath, `[${d.toLocaleString()}] [WARN] ${message} \n`);
    if (LogLevel > 3) return; 
    console.warn('[' + d.toLocaleString() + '] [' 
        + colours.yellow('WARN') + '] ' + message);
}

module.exports.error = function(message) {
    let d = moment().format(dateFormat);
    fs.appendFileSync(logPath, `[${d.toLocaleString()}] [ERROR] ${message} \n`);
    console.error('[' + d.toLocaleString() + '] [' 
        + colours.red('ERROR') + '] ' + message);
}

module.exports.panic = function(message) {
    let d = moment().format(dateFormat);
    fs.appendFileSync(logPath, `[${d.toLocaleString()}] [PANIC] ${message} \n`);
    console.error('[' + d.toLocaleString() + '] [' 
        + colours.red('PANIC') + '] ' + message);
    console.error('[' + d.toLocaleString() + '] [' 
        + colours.red('PANIC') + '] ABORTING...');
    process.exit();
}

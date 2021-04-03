
// page control logic

function pageLog(message)
{
    document.querySelector('#log-console').value += message + "\n"
    document.querySelector('#log-console').scrollTop = document.querySelector('#log-console').scrollHeight;
}

function onConnect()
{
    initLobbies();
}

function onDisconnect()
{
    destructLobbies();
    
    document.location.href += '../';
}

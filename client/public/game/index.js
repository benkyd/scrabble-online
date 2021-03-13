
// page control logic

function onConnect()
{
    initLobbies();


}

function onLobbyJoin(lobby)
{

}

function onDisconnect()
{
    destructLobbies();
    
    document.location.href = document.location.href + '../';
}

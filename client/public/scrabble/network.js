
// is game singleplayer?
const urlParser = new URLSearchParams(window.location.search);

let isSingleplayer = false;
if (urlParser.get('id') === null)
{
    isSingleplayer = true;
}

if (!isSingleplayer)
{
    // init socket
}



// is game singleplayer?
const urlParser = new URLSearchParams(window.location.search);

let isSingleplayer = false;
if (urlParser.get('uid') === null)
{
    isSingleplayer = true;
}

if (!isSingleplayer)
{
    // init socket
}


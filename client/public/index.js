const UsernameForm = document.querySelector('#input-username'); 
const UsernameInput = document.querySelector('#input-text-username');
// TODO: ^ LOWECASE U

const ConnectionState = document.querySelector('#connection-state');

UsernameForm.addEventListener('submit', onUsernameSubmit);

function playSingleplayer()
{
    window.location.pathname = "/scrabble";
}

// User submits their desired username
async function onUsernameSubmit(e)
{
    // Stop form refreshing page
    e.preventDefault();

    const chosenUsername = UsernameInput.value;

    const req = {
        username: chosenUsername,
        locale: localStorage.getItem('locale')
    };

    const res = await fetch('/login', {
        method: 'POST',
        body: JSON.stringify(req),
        headers: {
          'Content-Type': 'application/json'
        }
    });
    const body = JSON.parse(await res.text());

    // TODO: remove debug symbols
    console.log(body);

    if (body.errors)
    {
        ConnectionState.classList.add('red');
        ConnectionState.innerHTML = `${localeString('error-bold')}: ${localeString(body.errors[body.errors.length - 1].desc)}`;
        return;
    }

    if (ConnectionState.classList.contains('red'))
        ConnectionState.classList.remove('red');
    ConnectionState.innerHTML = '';

    // If success server garuntees user object
    if (body.login.success)
    {
        sessionStorage.setItem('user', JSON.stringify(body.login.user));
        console.log(sessionStorage.user)
        window.location.pathname = "/game";
    }
}

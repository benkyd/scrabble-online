const UsernameForm = document.querySelector('#input-username');
const UsernameInput = document.querySelector('#input-text-username');
UsernameForm.addEventListener('submit', onUsernameSubmit);

(()=>{

    // Presettup

})()


// User submits their desired username
async function onUsernameSubmit(e)
{
    // Stop form refreshing page
    e.preventDefault();

    const chosenUsername = UsernameInput.value;

    const req = {
        username: chosenUsername
    };

    const res = await fetch('/login', {
        method: 'POST',
        body: JSON.stringify(req),
        headers: {
          'Content-Type': 'application/json'
        }
    });
    const body = JSON.parse(await res.text());

    console.log(body);

}

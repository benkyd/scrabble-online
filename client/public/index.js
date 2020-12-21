const UsernameForm = document.querySelector('#input-username');
const UsernameInput = document.querySelector('#input-text-username');
UsernameForm.addEventListener('submit', onUsernameSubmit);

(()=>{

    // Presettup

})()


// User submits their desired username
function onUsernameSubmit(e)
{
    // Stop form refreshing page
    e.preventDefault();

    const chosenUsername = UsernameInput.value;

    const req = {
        username: chosenUsername
    };

    

    console.log(chosenUsername);
    
}

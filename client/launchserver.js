const Express = require('express');
const App = Express();
const Port = 8080;

App.use(express.static('public'))

App.listen(port, () => {
    console.log(`INFO: SERVER LISTENING ON ${{Port}}`);
})

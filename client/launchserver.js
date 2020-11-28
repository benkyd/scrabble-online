const Express = require('express');
const App = Express();
const Port = 8080;

const CATALOUGE_SERVER = 'localhost:8081';

App.use(Express.static('public'));

App.get('catalogue', async (req, res, next) => {
    res.end({server: CATALOUGE_SERVER});
});

App.listen(Port, () => {
    console.log(`INFO: SERVER LISTENING ON ${Port}`);
});

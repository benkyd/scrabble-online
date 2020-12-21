const Express = require('express');
const App = Express();
const Port = 8081;

App.use(Express.static('../client/public'));

App.get('catalogue', async (req, res, next) => {
    res.end({server: CATALOUGE_SERVER});
});

App.listen(Port, () => {
    console.log(`INFO: GAMESERVER LISTENING ON ${Port}`);
});

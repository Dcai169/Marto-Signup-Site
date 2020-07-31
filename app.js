const fs = require('fs');
// Express imports
const express = require('express');
const expressip = require('express-ip');
// const flash = require('connect-flash');
const routes = require('./routes.js');
const app = express();
<<<<<<< HEAD
const httpPort = 8770;
=======
const httpPort = process.env.PORT; //8770;
>>>>>>> c04134d... commit app to heroku
const server = require("http").createServer(app);
require('dotenv').config({ path: './config.env' });

app.set('view engine', 'pug');
app.use(expressip().getIpInfoMiddleware);
app.use(express.static(__dirname + "/public"));
app.use('/', routes);
server.listen(httpPort, () => {
    console.log('Server running on port ' + httpPort);
    console.log('============');
})

// Move entries from one sheet to another to reduce clutter

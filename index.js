const express = require('express');
const colors = require('colors');
const ejs = require('ejs');
const util = require('util');
const path = require('path');

const auth = require('../Aquamarine-Utils/middleware/auth_middleware');

const app = express();
app.set('view engine', 'ejs');

const config_http = require('./config/http.json');

//Grab logger middleware and use it. (Logs all incoming HTTP/HTTPS requests)
const logger = require('./middleware/log');
app.use(auth);
app.use(logger);
app.use(express.static(path.join(__dirname, ".././CDN_Files/")));
app.use(express.static(path.join(__dirname, "./static")));

//Grab index of all routes and set them in our express app
const routes = require('./routes/index');

app.use('/titles', routes.UI_TITLES);
app.use('/communities', routes.UI_COMMUNITIES);
app.use('/account', routes.UI_ACCOUNT_CREATION);

app.listen(config_http.port, () => {
    console.log("[INFO] Listening on port %d".green, config_http.port);
})

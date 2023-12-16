const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

route.get("/create_account", (req, res) => {
    res.render("create_account.ejs");
});

module.exports = route;
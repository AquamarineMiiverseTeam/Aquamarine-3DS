const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

route.get('/:id', (req, res) => {
    res.render('communities.ejs', {
        id : req.params['id']
    });
})

module.exports = route;
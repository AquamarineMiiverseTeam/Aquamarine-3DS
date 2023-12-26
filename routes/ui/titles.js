const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

const util = require('util');

const con = require('../../../database_con');
const query = util.promisify(con.query).bind(con);

route.get('/show', async (req, res) => {

    var communities = (await query("SELECT * FROM communities ORDER BY create_time DESC"));

    res.render('titles.ejs', {
        communities : communities,
        pjax : req.get('pjax')
    });
})

route.get('/activity_feed', (req, res) => {
    res.render('activity_feed')
})

route.get('/notifications', (req, res) => {
    res.render('notifications')
})

module.exports = route;

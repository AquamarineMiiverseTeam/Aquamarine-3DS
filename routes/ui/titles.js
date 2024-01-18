const express = require('express');
const route = express.Router();

const database_query = require('../../../Aquamarine-Utils/database_query');
const util = require('util');

const con = require('../../../Aquamarine-Utils/database_con');

route.get('/show', async (req, res) => {

    var communities = await database_query.getCommunities("desc", null, null, 0, null);

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

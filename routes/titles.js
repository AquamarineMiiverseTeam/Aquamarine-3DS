const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');
const Base64 = require('../static/js/base64');

const util = require('util');

const con = require('../database_con');
const query = util.promisify(con.query).bind(con);

route.get('/show', async (req, res) => {

    var communities = (await query("SELECT * FROM communities ORDER BY create_time DESC"));

    res.render('titles.ejs', {
        communities : communities
    });
})

route.get('/activity_feed', (req, res) => {
    res.render('activity_feed')
})

route.get('/notifications', (req, res) => {
    res.render('notifications')
})
 
route.get('/error/:error_id/:error_message?', (req, res) => {
    //Eventually look up error in database and find the correct message to go along with it. For now, we will use a test error.

    var error_string = "";
    var error_code = "AQ-" +
    // pad error id up to 6 zeros (if error length is over 6 it will return string), then get the first 6 characters to ensure its not over 6
    req.params['error_id'].padStart(6, '0').slice(0, 6);

    if (req.params['error_message'] != null) error_string = Base64.decode(decodeURIComponent(req.params['error_message']), );

    res.render('error', {
        error_string : error_string,
        error_code : error_code
    })
})

module.exports = route;

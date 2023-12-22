const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

const util = require('util');

const con = require('../../database_con');
const query = util.promisify(con.query).bind(con);

route.get('/:id', async(req, res) => {

    const community = (await query("SELECT * FROM communities WHERE id=?", req.params.id))[0]

    //TODO: add error page
    if (!community) {res.sendStatus(404);}
    
    const posts = await query("SELECT * FROM posts WHERE community_id=?", req.params.id)

    res.render('communities.ejs', {
        community : community,
        posts : posts
    });
})

module.exports = route;
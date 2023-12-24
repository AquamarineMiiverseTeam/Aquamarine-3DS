const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

const util = require('util');

const con = require('../../database_con');
const query = util.promisify(con.query).bind(con);

route.get('/:id', async(req, res) => {

    const community = (await query("SELECT * FROM communities WHERE id=?", req.params.id))[0];

    //TODO: add error page
    if (!community) {res.sendStatus(404);}
    
    const posts = await query("SELECT * FROM posts WHERE community_id=? ORDER BY create_time DESC", req.params.id);

    //Adding account data to each post
    for (let i = 0; i < posts.length; i++) {
        const account = (await query("SELECT * FROM accounts WHERE id=?", posts[i].account_id))[0];
        
        posts[i].mii_image = `http://mii-images.account.nintendo.net/${account.mii_hash}_normal_face.png`;
        posts[i].mii_name = account.mii_name;

        posts[i].is_empathied_by_user = (await query("SELECT * FROM empathies WHERE post_id=? AND account_id=?", [posts[i].id, req.account[0].id])).length;
        posts[i].empathy_count = (await query("SELECT * FROM empathies WHERE post_id=?", posts[i].id)).length;
    }

    res.render('communities.ejs', {
        community : community,
        posts : posts,
        moment : moment
    });
})

module.exports = route;
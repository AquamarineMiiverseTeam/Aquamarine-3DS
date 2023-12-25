const express = require('express');
const route = express.Router();
const xmlbuilder = require('xmlbuilder');
const moment = require('moment');

const util = require('util');

const con = require('../../../database_con');
const query = util.promisify(con.query).bind(con);

const ejs = require('ejs')

const Base64 = require('../../../base64')

route.get('/:id', async(req, res) => {
    //Getting page querys
    //im sorry trace
    const topic_tag = (req.query['topic_tag']) ? `AND topic_tag LIKE "%${req.query['topic_tag']}%"` : '';

    const community = (await query("SELECT * FROM communities WHERE id=?", req.params.id))[0];

    //TODO: add error page
    if (!community) {res.sendStatus(404);}
    
    const posts = await query(`SELECT * FROM posts WHERE community_id=? ${topic_tag} ORDER BY create_time DESC`, req.params.id);

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

route.get("/:id/posts", async(req, res) => {
    const community_id = req.params.id;
    const offset = (req.query['offset']) ? Number(req.query['offset']) : 0;
    const limit = (req.query['limit']) ? Number(req.query['limit']) : 1000000;
    const topic_tag = (req.query['topic_tag']) ? `AND topic_tag="${req.query['topic_tag']}"` : '';
    const yeahed = req.query['yeahed'];

    var posts = [];

    //Handeling different querys
    if (yeahed) {
        const empathys = await query(`
        SELECT empathies.post_id, empathies.account_id 
        FROM empathies 
        INNER JOIN accounts ON accounts.id=empathies.account_id 
        INNER JOIN posts ON posts.id=empathies.post_id
        WHERE accounts.id=? 
        AND posts.community_id=?
        ORDER BY posts.create_time DESC
        LIMIT ?, ?`, [req.account[0].id, req.params.id, offset, limit]);

        for (let i = 0; i < empathys.length; i++) {
            posts[i] = (await query("SELECT * FROM posts WHERE community_id=? AND id=? ORDER BY create_time DESC", [req.params.id, empathys[i].post_id]))[0];
        }

    } else if (topic_tag) {
        posts = await query(`SELECT * FROM posts WHERE community_id=? ${topic_tag} ORDER BY create_time DESC LIMIT ?, ?`, [req.params.id, offset, limit]);
    } else {
        posts = await query(`SELECT * FROM posts WHERE community_id=? ORDER BY create_time DESC LIMIT ?, ?`, [req.params.id, offset, limit]);
    }

    var post_html = "";

    //Adding account data to each post and rendering each post out
    for (let i = 0; i < posts.length; i++) {
        const account = (await query("SELECT * FROM accounts WHERE id=?", posts[i].account_id))[0];
        
        posts[i].mii_image = `http://mii-images.account.nintendo.net/${account.mii_hash}_normal_face.png`;
        posts[i].mii_name = account.mii_name;

        posts[i].is_empathied_by_user = (await query("SELECT * FROM empathies WHERE post_id=? AND account_id=?", [posts[i].id, req.account[0].id])).length;
        posts[i].empathy_count = (await query("SELECT * FROM empathies WHERE post_id=?", posts[i].id)).length;

        post_html += await ejs.renderFile('views/partials/post.ejs', { post : posts[i], moment : moment }, {rmWhitespace : true});
    }

    if (!post_html) { res.sendStatus(404); return; }

    res.send(post_html);
})

module.exports = route;
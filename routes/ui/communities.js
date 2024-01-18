const express = require('express');
const route = express.Router();
const moment = require('moment');

const database_query = require('../../../Aquamarine-Utils/database_query');

const util = require('util');

const con = require('../../../Aquamarine-Utils/database_con');
const query = util.promisify(con.query).bind(con);

const ejs = require('ejs')

route.get('/:id', async(req, res) => {
    //Getting page querys
    var community = req.params.id;

    //If the community id is zero, a game must be trying to access it's own community page, in this case, find the community that matches
    //the param_pack's title id
    if (community == 0) {
        console.log(req.param_pack.title_id)

        community = (await query(`SELECT * FROM communities WHERE title_ids LIKE "%${req.param_pack.title_id}%"`))[0]
        console.log(community)
    } else {
        community = (await query(`SELECT * FROM communities WHERE id=?`, community))[0]
    }

    //TODO: add error page
    if (!community) {res.sendStatus(404); return;}
    
    const posts = await database_query.getPosts(community.id, "desc", null, req.query['topic_tag'], 0, req);

    res.render('communities.ejs', {
        community : community,
        posts : posts,
        moment : moment,
        pjax : req.get('pjax')
    });
})

route.get("/:id/posts", async(req, res) => {
    const offset = (req.query['offset']) ? Number(req.query['offset']) : 0;
    const limit = (req.query['limit']) ? Number(req.query['limit']) : 1000000;
    const topic_tag = (req.query['topic_tag']) ? req.query['topic_tag'] : '';
    //const yeahed = req.query['yeahed'];

    var posts = await database_query.getPosts(req.params.id, "desc", limit, topic_tag, offset, req);


    var post_html = "";

    //Adding account data to each post and rendering each post out
    for (let i = 0; i < posts.length; i++) {
        post_html += await ejs.renderFile('views/partials/post.ejs', { post : posts[i], moment : moment }, {rmWhitespace : true});
    }

    if (!post_html) { res.sendStatus(404); return; }

    res.send(post_html);
})

route.get('/:community_id/post', async (req, res) => {
    var community = await database_query.getCommunity(req.params.community_id, req);

    res.render('post_menu.ejs', {
        community : community,
        pjax : req.get('pjax')
    });
})

module.exports = route;
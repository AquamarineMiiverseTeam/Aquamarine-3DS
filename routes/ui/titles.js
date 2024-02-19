const express = require('express');
const route = express.Router();

const common = require("../../../Aquamarine-Utils/common");

route.get('/show', async (req, res) => {

    var new_communities = await common.ui.getNewCommunities(5);
    var popular_communities = await common.ui.getPopularCommunities(5)

    res.render('titles.ejs', {
        new_communities : new_communities,
        popular_communities : popular_communities,
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

let router = require('express').Router();
let Comment = require('../../models/Comment');
let auth = require('../auth');

router.get('/', function(req, res, next) {
    res.json({'comment':'Comment root'});
});

module.exports = router;
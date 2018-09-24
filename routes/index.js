let router = require('express').Router();
router.get('/',(req,res)=>{
    res.redirect('/api');
})
router.use('/api', require('./api'));

module.exports = router;
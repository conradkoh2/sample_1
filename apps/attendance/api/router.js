var router = require('express').Router();
var ProcessAPI = require('./process');
router.get('/process', function (req, res) {
    res.send(ProcessAPI.process(req.query));
})
router.get('/', function (req, res) {
    res.send("asdf");
})
module.exports = router;
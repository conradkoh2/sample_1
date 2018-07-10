var router = require('express').Router();
var API = require('./api/router');
router.use('/api', API);
module.exports = router;
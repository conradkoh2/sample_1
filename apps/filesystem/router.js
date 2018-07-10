var express = require('express');
var router = express.Router();
var data = require(__dirname + '/data/router.js');
router.use('/', express.static(__dirname + '/public'));
router.use('/data', data.router);
module.exports = {router: router}
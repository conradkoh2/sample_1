var express = require('express');
var https = require('https');
var app = express();
var config = require('./config.js');
//var filesystem = require('./apps/filesystem/router.js');
var expedition = require('./apps/expedition/router.js');
var ATTENDANCE = require('./apps/attendance/router');
app.use('/', express.static('public'));
app.use('/attendance', ATTENDANCE);

//app.use('/filesystem', filesystem.router);
app.use('/expedition', expedition.router);

var server = app.listen(config.port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("%s host listening on port %s", host, config.port);
})
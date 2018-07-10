var express = require('express');
var fs = require('fs');
var router = express.Router();
var bodyParser = require('body-parser');
var bot = require('./bot.js');
var sessions = [];

const token = 'this-token-has-been-replaced';
router.use(bodyParser.json()); // to support JSON-encoded bodies
router.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

router.get('/incoming', function (req, res) {
    var response = {};
    bot.process_input(req.query).then(
        (resolved) => {
            res.send(JSON.stringify({
                text: resolved
            }));
        },
        (rejected) => {
            res.send(JSON.stringify({
                text: rejected
            }));
        }
    );
});

router.post('/incoming', function (req, res) {
    var response = {};
    bot.process_input(req.body).then(
        (resolved) => {
            res.send(JSON.stringify({
                text: resolved
            }));
        },
        (rejected) => {
            res.send(JSON.stringify({
                text: rejected
            }));
        }
    );
});

//Exports
module.exports = {
    router: router
}